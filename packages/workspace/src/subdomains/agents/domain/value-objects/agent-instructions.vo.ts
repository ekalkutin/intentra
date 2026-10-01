import { InvalidAgentException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 50000;

/** How an Agent works. The code frames them with the Project and the rules of the Member's Project Role. */
export class AgentInstructions {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidAgentException(
        `Agent instructions must be 1 to ${MAX_LENGTH} characters long`,
      );
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
