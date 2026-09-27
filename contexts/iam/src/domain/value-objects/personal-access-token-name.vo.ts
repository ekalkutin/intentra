import { InvalidPersonalAccessTokenNameException } from '../exceptions/index.js';

const MAX_LENGTH = 100;

/** Tells the tokens apart in the profile: "Claude Desktop", "Cursor". */
export class PersonalAccessTokenName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH) {
      throw new InvalidPersonalAccessTokenNameException(MAX_LENGTH);
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
