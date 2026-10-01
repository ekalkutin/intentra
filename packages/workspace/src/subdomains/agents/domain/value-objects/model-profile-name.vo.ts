import { InvalidModelProfileException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 64;

/** What a Model Profile is called, such as "Fast" or "Smart". */
export class ModelProfileName {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidModelProfileException(
        `Model profile name must be 1 to ${MAX_LENGTH} characters long`,
      );
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
