import { InvalidModelProfileException } from '../exceptions/index.js';

const MIN = 0;
const MAX = 2;

/** How freely a model picks its words: 0 is the most predictable. */
export class Temperature {
  readonly #value: number;

  constructor(value: number) {
    if (!Number.isFinite(value) || value < MIN || value > MAX) {
      throw new InvalidModelProfileException(
        `Temperature must be from ${MIN} to ${MAX}`,
      );
    }
    this.#value = value;
  }

  public get value(): number {
    return this.#value;
  }
}
