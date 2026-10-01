import { InvalidProviderKeyException } from '../exceptions/index.js';

import { ProviderKeyHint } from './provider-key-hint.vo.js';

const MAX_LENGTH = 256;
/** How many trailing characters the hint shows. */
const HINT_TAIL_LENGTH = 4;
/** OpenRouter's keys read `sk-or-v1-…`; the hint keeps that part whole. */
const KNOWN_PREFIX = /^sk-[a-z]+-v\d+-/;
/** The leading characters a hint shows of a key that does not start like that. */
const FALLBACK_PREFIX_LENGTH = 3;

/** A Provider Key itself, as the provider issued it. Only ever kept encrypted. */
export class ProviderKeySecret {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (
      trimmed.length <= HINT_TAIL_LENGTH * 2 ||
      trimmed.length > MAX_LENGTH ||
      /\s/.test(trimmed)
    ) {
      throw new InvalidProviderKeyException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }

  public hint(): ProviderKeyHint {
    const prefix =
      KNOWN_PREFIX.exec(this.#value)?.[0] ??
      this.#value.slice(0, FALLBACK_PREFIX_LENGTH);

    return new ProviderKeyHint(
      `${prefix}…${this.#value.slice(-HINT_TAIL_LENGTH)}`,
    );
  }
}
