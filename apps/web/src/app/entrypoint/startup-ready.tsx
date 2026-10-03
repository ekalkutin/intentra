import { useEffect, useSyncExternalStore } from 'react';

import { router } from '../routes';

const subscribe = (notify: () => void) => router.subscribe(notify);
const getSnapshot = () => router.state.initialized;

/** Dismiss only after the initial route has committed, including its lazy CSS. */
export function StartupReady() {
  const initialized = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!initialized || !document.getElementById('startup')) return;
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let minimumDuration = 0;
    // A failed/slow font must not block an otherwise usable application.
    const fontDeadline = window.setTimeout(reveal, 1200);
    function reveal() {
      if (cancelled) return;
      cancelled = true;
      window.clearTimeout(fontDeadline);
      const started =
        performance.getEntriesByName('intentra:startup')[0]?.startTime ??
        performance.now();
      minimumDuration = window.setTimeout(
        () => {
          firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame(() => {
              window.dispatchEvent(new Event('intentra:ready'));
            });
          });
        },
        Math.max(0, 2000 - (performance.now() - started)),
      );
    }
    void document.fonts.ready.then(reveal);
    return () => {
      cancelled = true;
      window.clearTimeout(fontDeadline);
      window.clearTimeout(minimumDuration);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [initialized]);

  return null;
}
