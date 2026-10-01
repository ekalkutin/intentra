import { useEffect, useState } from 'react';

import {
  fetchStats,
  isKeyAccepted,
  OpenRouterKeyRejectedError,
  type ModelOffer,
  type ModelStats,
} from './openrouter-models';

/** Speeds drift; a measure serves the tab for a while. */
const TTL_MS = 15 * 60 * 1000;
/** Requests at once: OpenRouter answers each in about a second. */
const CONCURRENCY = 6;
/** How often the table takes in what is measured so far. */
const FLUSH_MS = 400;

const cache = new Map<
  string,
  { readonly at: number; readonly value: ModelStats }
>();

/** Forgets every measure, so the next list is measured anew. */
export function forgetStats(): void {
  cache.clear();
}

/** A key OpenRouter could take; shorter input is still being typed. */
export const MIN_KEY_LENGTH = 8;

const KEY_STORAGE = 'intentra.platform.openrouterKey';

/** The key for measuring speed: this tab only, never sent to Intentra. */
export function readSpeedKey(): string {
  try {
    return sessionStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function writeSpeedKey(key: string): void {
  try {
    if (key) {
      sessionStorage.setItem(KEY_STORAGE, key);
    } else {
      sessionStorage.removeItem(KEY_STORAGE);
    }
  } catch {
    // Blocked storage: the key lives in the page only.
  }
}

export type Measures = {
  /** Speed and latency by model id; a model missing here is not measured yet. */
  readonly stats: ReadonlyMap<string, ModelStats>;
  /** Models still to measure. */
  readonly remaining: number;
  /** OpenRouter refused the key. */
  readonly rejected: boolean;
};

const fresh = (id: string) => {
  const hit = cache.get(id);
  return hit && Date.now() - hit.at < TTL_MS ? hit : null;
};

function cachedStats(offers: readonly ModelOffer[]): Map<string, ModelStats> {
  const stats = new Map<string, ModelStats>();
  for (const offer of offers) {
    const hit = fresh(offer.id);
    if (hit) {
      stats.set(offer.id, hit.value);
    }
  }
  return stats;
}

/** Measures every model's speed and latency with the key, a few at a time, in the given order. */
export function useModelStats(
  offers: readonly ModelOffer[] | undefined,
  key: string,
): Measures {
  const [stats, setStats] = useState<ReadonlyMap<string, ModelStats>>(() =>
    cachedStats(offers ?? []),
  );
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (!offers || key.trim().length < MIN_KEY_LENGTH) {
      setStats(cachedStats(offers ?? []));
      return;
    }
    const controller = new AbortController();
    const queue = offers.filter(offer => !fresh(offer.id));
    setRejected(false);
    setStats(cachedStats(offers));
    const flush = setInterval(() => setStats(cachedStats(offers)), FLUSH_MS);
    const worker = async () => {
      for (
        let offer = queue.shift();
        offer && !controller.signal.aborted;
        offer = queue.shift()
      ) {
        try {
          const value = await fetchStats(offer, key.trim(), controller.signal);
          cache.set(offer.id, { at: Date.now(), value });
        } catch (error) {
          if (error instanceof OpenRouterKeyRejectedError) {
            setRejected(true);
            controller.abort();
          } else if (!controller.signal.aborted) {
            cache.set(offer.id, {
              at: Date.now(),
              value: { throughput: null, latency: null },
            });
          }
        }
      }
    };
    void isKeyAccepted(key.trim(), controller.signal)
      .then(async accepted => {
        if (!accepted) {
          setRejected(true);
          controller.abort();
          return;
        }
        await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      })
      .finally(() => {
        clearInterval(flush);
        if (!controller.signal.aborted) {
          setStats(cachedStats(offers));
        }
      });
    return () => {
      controller.abort();
      clearInterval(flush);
    };
  }, [offers, key]);

  const remaining =
    offers && key.trim().length >= MIN_KEY_LENGTH && !rejected
      ? offers.filter(offer => !stats.has(offer.id)).length
      : 0;

  return { stats, remaining, rejected };
}
