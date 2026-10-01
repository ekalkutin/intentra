import { useCallback, useEffect, useState } from 'react';

import { fetchModelOffers, type ModelOffer } from './openrouter-models';

/** OpenRouter's list changes slowly; one answer serves the tab for a while. */
const TTL_MS = 15 * 60 * 1000;

let cache: { readonly at: number; readonly offers: ModelOffer[] } | null = null;

export type ModelOffers = {
  /** Undefined until loaded. */
  readonly offers: ModelOffer[] | undefined;
  readonly failed: boolean;
  /** Asking OpenRouter right now, the old list still shown. */
  readonly loading: boolean;
  readonly retry: () => void;
  /** Asks OpenRouter again, past the cache. */
  readonly refresh: () => void;
};

/** The models Agents can run on, asked of OpenRouter once `enabled`. */
export function useModelOffers(enabled: boolean): ModelOffers {
  const fresh = cache && Date.now() - cache.at < TTL_MS ? cache.offers : null;
  const [offers, setOffers] = useState<ModelOffer[] | undefined>(
    fresh ?? undefined,
  );
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || (cache && Date.now() - cache.at < TTL_MS)) {
      if (cache) {
        setOffers(cache.offers);
      }
      return;
    }
    const controller = new AbortController();
    setFailed(false);
    setLoading(true);
    fetchModelOffers(controller.signal)
      .then(loaded => {
        cache = { at: Date.now(), offers: loaded };
        setOffers(loaded);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          // oxlint-disable-next-line no-console -- why OpenRouter failed is for developers to see.
          console.warn(error);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [enabled, attempt]);

  const retry = useCallback(() => setAttempt(count => count + 1), []);
  const refresh = useCallback(() => {
    cache = null;
    setAttempt(count => count + 1);
  }, []);

  return { offers, failed, loading, retry, refresh };
}
