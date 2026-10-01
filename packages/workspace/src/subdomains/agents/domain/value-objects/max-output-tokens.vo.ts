import { InvalidModelProfileException } from '../exceptions/index.js';

const MAX = 1_000_000;

/** The longest answer a model may give, in tokens. */
export class MaxOutputTokens {
  readonly #value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > MAX) {
      throw new InvalidModelProfileException(
        `Maximum output tokens must be a whole number from 1 to ${MAX}`,
      );
    }
    this.#value = value;
  }

  public get value(): number {
    return this.#value;
  }
}
