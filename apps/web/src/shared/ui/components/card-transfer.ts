/** Shared Interview/landing choreography: text shimmer, arc, then a settling ring. */
export const MATERIALISE = {
  waveMs: 1000,
  wavePasses: 1,
  waveSpread: 48,
  flightMs: 900,
  arcPx: 48,
  landingMs: 600,
};

/** Animate a non-interactive copy between two measured elements. Returns an unmount cleanup. */
export function transferCard(
  from: Element,
  target: HTMLElement,
  {
    onLand,
    surface = document.body,
    prepare,
    reduced = false,
  }: {
    readonly onLand: () => void;
    readonly surface?: HTMLElement;
    readonly prepare?: (copy: HTMLElement) => void;
    readonly reduced?: boolean;
  },
): () => void {
  const start = from.getBoundingClientRect();
  if (
    reduced ||
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !target.offsetWidth ||
    start.bottom <= 0 ||
    start.top >= innerHeight
  ) {
    onLand();
    return () => {};
  }
  const { left, top, width, height } = target.getBoundingClientRect();
  const card = target.cloneNode(true) as HTMLElement;
  prepare?.(card);
  card.inert = true;
  card.setAttribute('aria-hidden', 'true');
  card.removeAttribute('id');
  card.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  Object.assign(card.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    margin: '0',
    width: `${width}px`,
    zIndex: '50',
    listStyle: 'none',
    pointerEvents: 'none',
    transformOrigin: 'top left',
    willChange: 'transform, opacity',
  });
  surface.append(card);
  const scale = Math.min(0.5, Math.max(0.25, (start.height * 3) / height));
  const flight = card.animate(
    [
      {
        transform: `translate(${start.left}px, ${start.top + (start.height - height * scale) / 2}px) scale(${scale})`,
        opacity: 0.4,
      },
      {
        transform: `translate(${(start.left + left) / 2}px, ${(start.top + top) / 2 - MATERIALISE.arcPx}px) scale(${(scale + 1) / 2})`,
        opacity: 1,
        offset: 0.5,
      },
      { transform: `translate(${left}px, ${top}px) scale(1)`, opacity: 1 },
    ],
    {
      duration: MATERIALISE.flightMs,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'forwards',
    },
  );
  let ring: HTMLElement | undefined;
  let landing: Animation | undefined;
  let firstFrame = 0,
    secondFrame = 0;
  const cleanup = () => {
    flight.onfinish = null;
    flight.cancel();
    landing?.cancel();
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
    card.remove();
    ring?.remove();
  };
  flight.onfinish = () => {
    onLand();
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        card.remove();
        if (!target.isConnected) return;
        const box = target.getBoundingClientRect();
        ring = document.createElement('span');
        ring.setAttribute('aria-hidden', 'true');
        ring.className =
          'pointer-events-none fixed top-0 left-0 z-50 rounded-lg border-2 border-brand will-change-[transform,opacity]';
        ring.style.width = `${box.width}px`;
        ring.style.height = `${box.height}px`;
        surface.append(ring);
        const at = `translate(${box.left}px, ${box.top}px)`;
        landing = ring.animate(
          [
            { transform: `${at} scale(1)`, opacity: 0.9 },
            { transform: `${at} scale(1.04)`, opacity: 0 },
          ],
          {
            duration: MATERIALISE.landingMs,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          },
        );
        landing.onfinish = () => ring?.remove();
      });
    });
  };
  return cleanup;
}
