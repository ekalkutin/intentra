/** Marks a Related Tile that a line elsewhere on the page can bring into view. */
export const REVEALABLE_KEY_ATTRIBUTE = 'data-revealable-key';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * How long the page must stay still before the glow starts, where the browser
 * does not tell the end of a scroll: longer before the first move, since a
 * smooth scroll takes a few frames to begin, and no move at all means none
 * was needed.
 */
const FIRST_MOVE_MS = 300;
const STILL_MS = 150;

/**
 * Brings the tile of a linked item into view and lights its frame once in the
 * brand's ink, so the eye lands on it; its link takes the focus, so the
 * keyboard lands there too. Under reduced motion it jumps and does not glow.
 */
export function revealRelated(key: string): void {
  const tile = document.querySelector<HTMLElement>(
    `[${REVEALABLE_KEY_ATTRIBUTE}="${CSS.escape(key)}"]`,
  );
  if (!tile) {
    return;
  }
  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  tile.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'center',
  });
  tile.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  if (reduced) {
    return;
  }

  // The glow starts once the scroll has settled, or the eye would miss it:
  // when the browser says it ended, or once the page has been still a moment.
  let still = window.setTimeout(() => glow(), FIRST_MOVE_MS);
  let moved = false;
  const moving = () => {
    moved = true;
    window.clearTimeout(still);
    still = window.setTimeout(() => glow(), STILL_MS);
  };
  const glow = () => {
    window.clearTimeout(still);
    document.removeEventListener('scroll', moving, { capture: true });
    document.removeEventListener('scrollend', settled, { capture: true });
    tile.animate(
      [
        { borderColor: 'var(--border)', boxShadow: '0 0 0 0 transparent' },
        {
          borderColor: 'color-mix(in oklch, var(--brand) 65%, transparent)',
          boxShadow:
            '0 0 0 4px color-mix(in oklch, var(--brand) 22%, transparent)',
          offset: 0.2,
        },
        { borderColor: 'var(--border)', boxShadow: '0 0 0 0 transparent' },
      ],
      { duration: 1800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  };
  document.addEventListener('scroll', moving, { capture: true, passive: true });
  // Only the end of this scroll: one that ended before it began says nothing.
  const settled = () => {
    if (moved) {
      glow();
    }
  };
  document.addEventListener('scrollend', settled, { capture: true });
}
