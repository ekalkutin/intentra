import { useSyncExternalStore } from 'react';

import { MATERIALISE, transferCard } from '@/shared/ui';

export { MATERIALISE };

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
/** A tile's real content, unseen while its card is on the way; the flying copy shows it. */
export const TILE_CONTENT_ATTRIBUTE = 'data-tile-content';
/** The skeleton a tile shows while its card is on the way; the flying copy drops it. */
export const TILE_PLACEHOLDER_ATTRIBUTE = 'data-tile-placeholder';
const HIDDEN_CLASS = 'opacity-0';
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
  if (!target) {
    landed(key);
    return;
  }
  transferCard(from, target, {
    onLand: () => landed(key),
    prepare: card => {
      card.removeAttribute(CAPTURED_KEY_ATTRIBUTE);
      card
        .querySelectorAll(`[${TILE_PLACEHOLDER_ATTRIBUTE}]`)
        .forEach(element => element.remove());
      card
        .querySelectorAll(`[${TILE_CONTENT_ATTRIBUTE}]`)
        .forEach(element => element.classList.remove(HIDDEN_CLASS));
    },
  });
}
