import { useEffect, useState, type RefObject } from 'react';

/** How far ahead of the screen an element counts as near: about one screen. */
const AHEAD = '600px 0px';

/**
 * Whether the element has come near the screen, to load or draw it only then.
 * Once near, it stays so; `initial` starts it near, such as for a part the
 * person has already seen.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  { initial = false }: { readonly initial?: boolean } = {},
): boolean {
  const [near, setNear] = useState(initial);

  useEffect(() => {
    const element = ref.current;
    if (near || !element) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setNear(true);
        }
      },
      { rootMargin: AHEAD },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, near]);

  return near;
}

/**
 * Calls back each time the element comes near the screen, such as the last
 * row of a list asking for more.
 */
export function useWhenNearViewport(
  ref: RefObject<Element | null>,
  onNear: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          onNear();
        }
      },
      { rootMargin: AHEAD },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, onNear, enabled]);
}
