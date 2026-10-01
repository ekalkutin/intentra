import { useSyncExternalStore } from 'react';

/** How the materialising looks and moves, in one place. */
export const MATERIALISE = {
  /** How long one pass of the brand shimmer takes across the record's text. */
  waveMs: 1000,
  /** How many times the shimmer runs across it before the key leaves. */
  wavePasses: 1,
  /** How wide the shimmer's highlight is, in pixels. */
  waveSpread: 48,
  /** How long the key takes to fly from the answer to the panel. */
  flightMs: 900,
  /** How high the flight arcs above the straight line between the two. */
  arcPx: 48,
  /** How long the tile's ring takes to swell and fade as the key lands. */
  landingMs: 600,
};

export type MaterialiseSettings = typeof MATERIALISE;

/** The pause between the wave ending and the key leaving. */
const WAVE_TO_FLIGHT_MS = 50;

/** When, after the line appears, the key leaves for the panel. */
export function flightDelay(): number {
  return MATERIALISE.waveMs * MATERIALISE.wavePasses + WAVE_TO_FLIGHT_MS;
}

/** A tile never waits longer than this for its key, whatever went wrong. */
function landingDeadline(): number {
  return flightDelay() + MATERIALISE.flightMs + 1500;
}
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** The card eases off the record and eases into its place. */
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
/** How small the card is as it leaves the record, as a share of its size. */
const MIN_START_SCALE = 0.25;
const MAX_START_SCALE = 0.5;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
/** A tile's real content, unseen while its card is on the way; the flying copy shows it. */
export const TILE_CONTENT_ATTRIBUTE = 'data-tile-content';
/** The skeleton a tile shows while its card is on the way; the flying copy drops it. */
export const TILE_PLACEHOLDER_ATTRIBUTE = 'data-tile-placeholder';
const HIDDEN_CLASS = 'opacity-0';
/** The ring a tile takes the key with, laid over it so the tile itself never repaints. */
const RING_CLASS =
  'pointer-events-none fixed top-0 left-0 z-50 rounded-lg border-2 border-brand will-change-[transform,opacity]';

/** The tile in the panel that shows an item the Conversation recorded. */
export const CAPTURED_KEY_ATTRIBUTE = 'data-captured-key';

// Keys on their way to the panel: their tiles wait, unseen, until they land.
const incoming = new Set<string>();
const deadlines = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

/**
 * A key will fly, said while its line first renders and before the panel
 * draws its tile, so the tile never shows early. Quiet: nothing re-renders.
 */
export function markIncoming(key: string): void {
  incoming.add(key);
}

/** A key is about to fly: its tile waits for it (never past the deadline). */
export function expectLanding(key: string): void {
  incoming.add(key);
  clearTimeout(deadlines.get(key));
  deadlines.set(
    key,
    setTimeout(() => landed(key), landingDeadline()),
  );
  emit();
}

/** The key arrived, or will not fly: its tile shows. */
export function landed(key: string): void {
  clearTimeout(deadlines.get(key));
  deadlines.delete(key);
  if (incoming.delete(key)) {
    emit();
  }
}

/** Whether the tile of a key still waits for it. */
export function useIncoming(key: string): boolean {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => incoming.has(key),
  );
}

/**
 * The card, once the shimmer has run over its record, leaves the answer and flies in an arc to
 * its tile, which shows as it lands. When it cannot fly (reduced motion, the
 * panel hidden, the line out of sight) the tile simply shows. Only transform
 * and opacity move, so it runs on the compositor and stays smooth while the
 * answer still streams in on the main thread.
 */
export function flyToCaptured(from: Element, key: string): void {
  const target = document.querySelector<HTMLElement>(
    `[${CAPTURED_KEY_ATTRIBUTE}="${CSS.escape(key)}"]`,
  );
  const start = from.getBoundingClientRect();
  const visible = start.bottom > 0 && start.top < window.innerHeight;
  if (
    window.matchMedia(REDUCED_MOTION).matches ||
    !target ||
    target.offsetWidth === 0 ||
    !visible
  ) {
    landed(key);
    return;
  }

  const { left, top, width, height } = target.getBoundingClientRect();

  // The card itself flies: a copy of the tile that starts as small as the
  // record's line and grows into the tile on the way.
  const card = target.cloneNode(true) as HTMLElement;
  card.removeAttribute(CAPTURED_KEY_ATTRIBUTE);
  card
    .querySelectorAll(`[${TILE_PLACEHOLDER_ATTRIBUTE}]`)
    .forEach(element => element.remove());
  card
    .querySelectorAll(`[${TILE_CONTENT_ATTRIBUTE}]`)
    .forEach(element => element.classList.remove(HIDDEN_CLASS));
  card.setAttribute('aria-hidden', 'true');
  Object.assign(card.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    margin: '0',
    width: `${width}px`,
    zIndex: '50',
    // A list item torn from its list would show a bullet.
    listStyle: 'none',
    pointerEvents: 'none',
    transformOrigin: 'top left',
    willChange: 'transform, opacity',
  });
  document.body.append(card);

  // It leaves as a small card about the record's height, at most half size.
  const scale = Math.min(
    MAX_START_SCALE,
    Math.max(MIN_START_SCALE, (start.height * 3) / height),
  );
  const startAt = `translate(${start.left}px, ${start.top + (start.height - height * scale) / 2}px) scale(${scale})`;
  const midX = (start.left + left) / 2;
  const midY = (start.top + top) / 2 - MATERIALISE.arcPx;
  const midScale = (scale + 1) / 2;
  const flight = card.animate(
    [
      { transform: startAt, opacity: 0.4 },
      {
        transform: `translate(${midX}px, ${midY}px) scale(${midScale})`,
        opacity: 1,
        offset: 0.5,
      },
      { transform: `translate(${left}px, ${top}px) scale(1)`, opacity: 1 },
    ],
    { duration: MATERIALISE.flightMs, easing: EASE_IN_OUT, fill: 'forwards' },
  );
  flight.onfinish = () => {
    // The card shows at once under the copy, then the copy goes: no seam.
    landed(key);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        card.remove();
        ring(target);
      }),
    );
  };
}

/** The tile takes the key: a brand ring laid over it swells and fades. */
function ring(tile: Element): void {
  const box = tile.getBoundingClientRect();
  const element = document.createElement('span');
  element.className = RING_CLASS;
  element.style.width = `${box.width}px`;
  element.style.height = `${box.height}px`;
  document.body.append(element);
  const at = `translate(${box.left}px, ${box.top}px)`;
  const landing = element.animate(
    [
      { transform: `${at} scale(1)`, opacity: 0.9 },
      { transform: `${at} scale(1.04)`, opacity: 0 },
    ],
    {
      duration: MATERIALISE.landingMs,
      easing: EASE_OUT_EXPO,
      fill: 'forwards',
    },
  );
  landing.onfinish = () => element.remove();
}
