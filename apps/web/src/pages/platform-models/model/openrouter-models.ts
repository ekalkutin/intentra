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

export const SORT_KEYS = {
  name: 'name',
  inputPrice: 'inputPrice',
  outputPrice: 'outputPrice',
  contextLength: 'contextLength',
} as const;

export type SortKey = (typeof SORT_KEYS)[keyof typeof SORT_KEYS];

export type Sort = { readonly key: SortKey; readonly ascending: boolean };

/** The offers the search matches by name or id, in the chosen order, unknown values last. */
export function findOffers(
  offers: readonly ModelOffer[],
  search: string,
  sort: Sort,
): ModelOffer[] {
  const needle = search.trim().toLowerCase();
  const found = needle
    ? offers.filter(
        offer =>
          offer.id.toLowerCase().includes(needle) ||
          offer.name.toLowerCase().includes(needle),
      )
    : [...offers];
  const direction = sort.ascending ? 1 : -1;

  return found.sort((one, other) => {
    if (sort.key === SORT_KEYS.name) {
      return one.name.localeCompare(other.name) * direction;
    }
    const a = one[sort.key];
    const b = other[sort.key];
    if (a === null || b === null) {
      return a === b ? 0 : a === null ? 1 : -1;
    }
    return (a - b) * direction;
  });
}
