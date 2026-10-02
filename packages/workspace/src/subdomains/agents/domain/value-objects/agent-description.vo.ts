import { InvalidAgentException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 1024;

/** What an Agent is for; Intentra reads a Specialist's to decide when to call it. */
export class AgentDescription {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidAgentException(
        `Agent description must be 1 to ${MAX_LENGTH} characters long`,
      );
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
