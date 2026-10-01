import { MODEL_ID_PATTERN } from './model-profile-form';

/**
 * OpenRouter's public list of models: open to the browser (CORS) and needing
 * no key. For the MVP the browser asks it directly and applies the rule of
 * which models Intentra's Agents can run on.
 */
const MODELS_URL = 'https://openrouter.ai/api/v1/models';

/** The prefix of Mastra's model router ids for OpenRouter's models. */
const ROUTER_PREFIX = 'openrouter/';

/** Every Agent calls tools, so a model must take them and the choice among them. */
const REQUIRED_PARAMETERS = ['tools', 'tool_choice'] as const;
const TEXT = 'text';
const TOKENS_PER_PRICE = 1_000_000;

/** The part of OpenRouter's answer this reads. */
type RawModel = {
  readonly id: string;
  readonly name?: string;
  readonly context_length?: number | null;
  readonly architecture?: { readonly output_modalities?: readonly string[] };
  readonly pricing?: {
    readonly prompt?: string;
    readonly completion?: string;
  };
  readonly top_provider?: { readonly max_completion_tokens?: number | null };
  readonly supported_parameters?: readonly string[];
};

/** A model an Agent can run on, as the picker shows it. */
export type ModelOffer = {
  /** As a Model Profile keeps it, such as `openrouter/anthropic/claude-sonnet-5`. */
  readonly id: string;
  readonly name: string;
  readonly contextLength: number | null;
  /** Dollars per million tokens; null when OpenRouter gives none (a router). */
  readonly inputPrice: number | null;
  readonly outputPrice: number | null;
  readonly maxOutputTokens: number | null;
  /** Takes a temperature; one that does not ignores a Model Profile's. */
  readonly temperature: boolean;
  /** Takes a reasoning effort. */
  readonly reasoning: boolean;
};

/** Calls tools, answers in text, and has an id the server takes. */
export function canRunAgents(model: RawModel): boolean {
  const parameters = model.supported_parameters ?? [];
  return (
    REQUIRED_PARAMETERS.every(parameter => parameters.includes(parameter)) &&
    (model.architecture?.output_modalities ?? [TEXT]).includes(TEXT) &&
    MODEL_ID_PATTERN.test(`${ROUTER_PREFIX}${model.id}`)
  );
}

/** A price per token as dollars per million; null for none or a router's -1. */
function perMillion(price: string | undefined): number | null {
  const value = Number(price);
  if (price === undefined || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value * TOKENS_PER_PRICE * 1000) / 1000;
}

export function toOffer(model: RawModel): ModelOffer {
  const parameters = model.supported_parameters ?? [];
  return {
    id: `${ROUTER_PREFIX}${model.id}`,
    name: model.name ?? model.id,
    contextLength: model.context_length ?? null,
    inputPrice: perMillion(model.pricing?.prompt),
    outputPrice: perMillion(model.pricing?.completion),
    maxOutputTokens: model.top_provider?.max_completion_tokens ?? null,
    temperature: parameters.includes('temperature'),
    reasoning: parameters.includes('reasoning'),
  };
}

export async function fetchModelOffers(
  signal?: AbortSignal,
): Promise<ModelOffer[]> {
  const response = await fetch(MODELS_URL, { signal });
  if (!response.ok) {
    throw new Error(`OpenRouter answered ${response.status}`);
  }
  const body = (await response.json()) as { data?: readonly RawModel[] };
  return (body.data ?? []).filter(canRunAgents).map(toOffer);
}

/** OpenRouter's id of a model, without the router's prefix. */
function openRouterId(offer: ModelOffer): string {
  return offer.id.slice(ROUTER_PREFIX.length);
}

/** One provider serving a model, as `/models/{id}/endpoints` describes it. */
type RawEndpoint = {
  readonly uptime_last_30m?: number | null;
  readonly throughput_last_30m?: RawStatistic;
  readonly latency_last_30m?: RawStatistic;
};

/** OpenRouter gives a statistic as a number or as percentiles. */
type RawStatistic = number | { readonly p50?: number } | null | undefined;

function median(value: RawStatistic): number | null {
  const number = typeof value === 'number' ? value : (value?.p50 ?? null);
  return number !== null && number > 0 ? number : null;
}

/** How fast a model answers over the last half hour. */
export type ModelStats = {
  /** Tokens per second at the fastest live provider; null when none says. */
  readonly throughput: number | null;
  /** Milliseconds to the first token at the quickest live provider; null when none says. */
  readonly latency: number | null;
};

const NO_STATS: ModelStats = { throughput: null, latency: null };

export function toStats(endpoints: readonly RawEndpoint[]): ModelStats {
  const live = endpoints.filter(
    endpoint => (endpoint.uptime_last_30m ?? 0) > 0,
  );
  const known = (values: (number | null)[]) =>
    values.filter((value): value is number => value !== null);
  const speeds = known(
    live.map(endpoint => median(endpoint.throughput_last_30m)),
  );
  const latencies = known(
    live.map(endpoint => median(endpoint.latency_last_30m)),
  );

  return {
    throughput: speeds.length === 0 ? null : Math.round(Math.max(...speeds)),
    latency: latencies.length === 0 ? null : Math.round(Math.min(...latencies)),
  };
}

/** Thrown when OpenRouter refuses the key used to measure speed. */
export class OpenRouterKeyRejectedError extends Error {}

const UNAUTHORIZED = 401;

const KEY_URL = 'https://openrouter.ai/api/v1/key';

/**
 * Whether OpenRouter takes the key. `/endpoints` answers a wrong key as if
 * there were none (no speeds), so the key is checked first; a failure to ask
 * counts as taken, the measuring then shows what it can.
 */
export async function isKeyAccepted(
  key: string,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const response = await fetch(KEY_URL, {
      headers: { Authorization: `Bearer ${key}` },
      signal,
    });
    return response.status !== UNAUTHORIZED;
  } catch {
    return true;
  }
}

/** How fast a model answers; OpenRouter gives it only to a request with a key. */
export async function fetchStats(
  offer: ModelOffer,
  key: string,
  signal?: AbortSignal,
): Promise<ModelStats> {
  const response = await fetch(
    `${MODELS_URL}/${openRouterId(offer)}/endpoints`,
    { headers: { Authorization: `Bearer ${key}` }, signal },
  );
  if (response.status === UNAUTHORIZED) {
    throw new OpenRouterKeyRejectedError();
  }
  if (!response.ok) {
    return NO_STATS;
  }
  const body = (await response.json()) as {
    data?: { endpoints?: readonly RawEndpoint[] };
  };
  return toStats(body.data?.endpoints ?? []);
}

/** A row of the catalog: a model with its speed and latency, null when unknown or not measured yet. */
export type CatalogRow = ModelOffer & ModelStats;

export function withStats(
  offers: readonly ModelOffer[],
  stats: ReadonlyMap<string, ModelStats>,
): CatalogRow[] {
  return offers.map(offer => ({
    ...offer,
    ...(stats.get(offer.id) ?? NO_STATS),
  }));
}

export const PRICE_FILTERS = {
  all: 'all',
  free: 'free',
  paid: 'paid',
} as const;

export type PriceFilter = (typeof PRICE_FILTERS)[keyof typeof PRICE_FILTERS];

export type OfferFilter = {
  readonly search: string;
  readonly price: PriceFilter;
  /** Tokens per second at least; null for any speed, unknown included. */
  readonly minThroughput: number | null;
  /** Milliseconds to the first token at most; null for any, unknown included. */
  readonly maxLatency: number | null;
};

/** Free costs nothing either way; a router with no price is neither free nor paid. */
function matchesPrice(row: CatalogRow, price: PriceFilter): boolean {
  if (price === PRICE_FILTERS.all) {
    return true;
  }
  if (row.inputPrice === null || row.outputPrice === null) {
    return false;
  }
  const free = row.inputPrice === 0 && row.outputPrice === 0;
  return price === PRICE_FILTERS.free ? free : !free;
}

export const SORT_KEYS = {
  name: 'name',
  inputPrice: 'inputPrice',
  outputPrice: 'outputPrice',
  contextLength: 'contextLength',
  throughput: 'throughput',
  latency: 'latency',
} as const;

export type SortKey = (typeof SORT_KEYS)[keyof typeof SORT_KEYS];

export type Sort = { readonly key: SortKey; readonly ascending: boolean };

const BY_NAME: Sort = { key: SORT_KEYS.name, ascending: true };

/**
 * The rows the filter lets through (the search by name or id), in the
 * chosen order (by name unless told), unknown values last.
 */
export function findOffers<Row extends ModelOffer>(
  rows: readonly Row[],
  filter: Partial<OfferFilter>,
  sort: Sort = BY_NAME,
): Row[] {
  const {
    search = '',
    price = PRICE_FILTERS.all,
    minThroughput = null,
    maxLatency = null,
  } = filter;
  const needle = search.trim().toLowerCase();
  const found = rows.filter(row => {
    const catalogRow = { ...NO_STATS, ...row } as CatalogRow;
    return (
      (!needle ||
        row.id.toLowerCase().includes(needle) ||
        row.name.toLowerCase().includes(needle)) &&
      matchesPrice(catalogRow, price) &&
      (minThroughput === null ||
        (catalogRow.throughput !== null &&
          catalogRow.throughput >= minThroughput)) &&
      (maxLatency === null ||
        (catalogRow.latency !== null && catalogRow.latency <= maxLatency))
    );
  });
  const direction = sort.ascending ? 1 : -1;

  return found.sort((one, other) => {
    if (sort.key === SORT_KEYS.name) {
      return one.name.localeCompare(other.name) * direction;
    }
    const a = (one as Partial<CatalogRow>)[sort.key] ?? null;
    const b = (other as Partial<CatalogRow>)[sort.key] ?? null;
    if (a === null || b === null) {
      return a === b ? 0 : a === null ? 1 : -1;
    }
    return (a - b) * direction;
  });
}
