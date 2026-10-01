import { InvalidModelProfileException } from '../exceptions/index.js';

/** A Mastra model router id on OpenRouter. */
const PATTERN = /^openrouter\/[a-z0-9._-]+\/[A-Za-z0-9._:-]+$/;
const MAX_LENGTH = 200;

/** A model on OpenRouter, such as `openrouter/anthropic/claude-sonnet-5`. */
export class ModelId {
  readonly #value: string;

  constructor(value: string) {
    const id = value.trim();
    if (id.length > MAX_LENGTH || !PATTERN.test(id)) {
      throw new InvalidModelProfileException(
        'Model id must read openrouter/<vendor>/<model>',
      );
    }
    this.#value = id;
  }

  public get value(): string {
    return this.#value;
  }
}
