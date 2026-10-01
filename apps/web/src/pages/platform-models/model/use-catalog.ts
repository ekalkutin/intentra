import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelOffer, ModelStats } from './openrouter-models';
import { useModelOffers, type ModelOffers } from './use-model-offers';
import {
  forgetStats,
  MIN_KEY_LENGTH,
  readSpeedKey,
  useModelStats,
  writeSpeedKey,
  type Measures,
} from './use-model-stats';

export type Catalog = {
  readonly offers: ModelOffers;
  readonly measures: Measures;
  readonly key: string;
  readonly setKey: (key: string) => void;
  /** A key is given and not refused: speeds and latencies come in. */
  readonly hasKey: boolean;
  /** The list or its measures are still coming in. */
  readonly refreshing: boolean;
  /** Asks OpenRouter again for the list and every measure. */
  readonly refresh: () => void;
  readonly offerOf: (modelId: string) => ModelOffer | undefined;
  /** A model's speed and latency; undefined while not measured. */
  readonly statsOf: (modelId: string) => ModelStats | undefined;
};

/**
 * OpenRouter's models for the page: the list, and with a key each model's
 * speed and latency, the models in `firstIds` measured first.
 */
export function useCatalog(firstIds: readonly string[]): Catalog {
  const offers = useModelOffers(true);
  const [key, setKeyState] = useState(readSpeedKey);
  const first = firstIds.join('\n');
  const ordered = useMemo(() => {
    if (!offers.offers) {
      return undefined;
    }
    const wanted = new Set(first.split('\n'));
    return [
      ...offers.offers.filter(offer => wanted.has(offer.id)),
      ...offers.offers.filter(offer => !wanted.has(offer.id)),
    ];
  }, [offers.offers, first]);
  const measures = useModelStats(ordered, key);
  const byId = useMemo(
    () => new Map((offers.offers ?? []).map(offer => [offer.id, offer])),
    [offers.offers],
  );
  const { refresh: refreshOffers } = offers;

  const setKey = useCallback((next: string) => {
    setKeyState(next);
    writeSpeedKey(next.trim());
  }, []);
  const refresh = useCallback(() => {
    forgetStats();
    refreshOffers();
  }, [refreshOffers]);

  return {
    offers,
    measures,
    key,
    setKey,
    hasKey: key.trim().length >= MIN_KEY_LENGTH && !measures.rejected,
    refreshing: offers.loading || measures.remaining > 0,
    refresh,
    offerOf: modelId => byId.get(modelId),
    statsOf: modelId => measures.stats.get(modelId),
  };
}

/** How the page writes a model's figures. */
export function useModelFormat() {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });
  const tenths = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  });

  return {
    price: (value: number | null) =>
      value === null ? '—' : `$${number.format(value)}`,
    context: (value: number | null) =>
      value === null
        ? '—'
        : value >= 1_000_000
          ? `${number.format(value / 1_000_000)}M`
          : `${Math.round(value / 1000)}K`,
    seconds: (milliseconds: number) => tenths.format(milliseconds / 1000),
    speed: (value: number) => t('platformModels.catalog.speed', { value }),
    latency: (milliseconds: number) =>
      t('platformModels.catalog.latencyValue', {
        value: tenths.format(milliseconds / 1000),
      }),
  };
}
