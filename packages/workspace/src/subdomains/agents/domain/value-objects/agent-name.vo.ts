import { InvalidAgentException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 64;

/** What people and Intentra call an Agent. */
export class AgentName {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidAgentException(
        `Agent name must be 1 to ${MAX_LENGTH} characters long`,
      );
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
