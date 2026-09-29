import { InvalidRationaleException } from '../exceptions/index.js';

const MAX_LENGTH = 2000;

/** A short quote or summary of what a Knowledge Item rests on. */
export class Rationale {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidRationaleException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
