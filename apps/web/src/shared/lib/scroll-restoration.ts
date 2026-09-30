import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router';

/** Where each page (by its path and query) was scrolled to, this session. */
const positions = new Map<string, number>();

/** How long a page may take to grow tall enough to scroll back to. */
const RESTORE_FRAMES = 60;

const RESTORE_KEY = 'restoreScroll';

/** Link state that takes the person back to where the page was scrolled, as the browser's back does. */
export const RESTORE_SCROLL_STATE = { [RESTORE_KEY]: true } as const;

function wantsRestore(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    RESTORE_KEY in state &&
    state[RESTORE_KEY] === true
  );
}

/**
 * Scroll restoration for a scrolling element that is not the window (the
 * app's canvas): a new page opens at the top; going back, by the browser or
 * by a link with `RESTORE_SCROLL_STATE`, returns to where it was scrolled,
 * waiting for its content to load if need be.
 */
export function useScrollRestoration(ref: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const page = `${location.pathname}${location.search}`;
  // The page the scroll belongs to, switched before the scroll is moved, so
  // that moving it for a new page never overwrites the old page's position.
  const current = useRef(page);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const remember = () => positions.set(current.current, element.scrollTop);
    element.addEventListener('scroll', remember, { passive: true });
    return () => element.removeEventListener('scroll', remember);
  }, [ref]);

  useLayoutEffect(() => {
    const element = ref.current;
    current.current = page;
    if (!element) {
      return;
    }
    const saved = positions.get(page);
    const restore =
      saved !== undefined &&
      (navigationType === NavigationType.Pop || wantsRestore(location.state));
    if (!restore) {
      element.scrollTop = 0;
      return;
    }
    let frames = 0;
    let frame = 0;
    const step = () => {
      element.scrollTop = saved;
      frames += 1;
      if (Math.abs(element.scrollTop - saved) > 1 && frames < RESTORE_FRAMES) {
        frame = requestAnimationFrame(step);
      }
    };
    step();
    return () => cancelAnimationFrame(frame);
    // Only a new location moves the scroll.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
}
