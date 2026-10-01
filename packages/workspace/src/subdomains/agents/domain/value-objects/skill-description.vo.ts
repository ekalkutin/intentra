import { InvalidSkillException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 1024;

/** When to use a Skill; an Agent always sees it. */
export class SkillDescription {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidSkillException(
        `Skill description must be 1 to ${MAX_LENGTH} characters long`,
      );
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
