import { InvalidPersonNameException } from '../../exceptions/index.js';

const MAX_LENGTH = 100;

/** What a person is called, such as "Ada Lovelace". */
export class PersonName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidPersonNameException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
