import { InvalidDisplayNameException } from '../exceptions/index.js';

const MAX_LENGTH = 80;

/** How an account is shown to other members: "Ann Lee". */
export class DisplayName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH) {
      throw new InvalidDisplayNameException(MAX_LENGTH);
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
