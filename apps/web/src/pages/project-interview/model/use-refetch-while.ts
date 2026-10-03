import { useEffect, useRef } from 'react';

/**
 * Calls `refetch` every `intervalMs` while `waiting` holds, at most `attempts`
 * times each time it starts to hold: for what the server finishes on its own,
 * such as an answer still running or a title suggested after it.
 */
export function useRefetchWhile(
  waiting: boolean,
  refetch: () => unknown,
  {
    intervalMs,
    attempts = Infinity,
  }: { intervalMs: number; attempts?: number },
): void {
  const latest = useRef(refetch);

  useEffect(() => {
    latest.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!waiting) {
      return;
    }
    let made = 0;
    const timer = setInterval(() => {
      made += 1;
      latest.current();
      if (made >= attempts) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [waiting, intervalMs, attempts]);
}
