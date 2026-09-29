import { InvalidPersonalAccessTokenNameException } from '../exceptions/index.js';

const MAX_LENGTH = 100;

/** What the Member calls the token, such as "Claude Code on my laptop". */
export class PersonalAccessTokenName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidPersonalAccessTokenNameException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
