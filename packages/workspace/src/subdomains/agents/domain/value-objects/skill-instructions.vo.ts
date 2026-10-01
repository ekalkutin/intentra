import { InvalidSkillException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 50000;

/** A Skill's know-how in markdown, read only when a task calls for it. */
export class SkillInstructions {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidSkillException(
        `Skill instructions must be 1 to ${MAX_LENGTH} characters long`,
      );
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
