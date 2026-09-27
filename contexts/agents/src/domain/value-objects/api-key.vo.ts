import { InvalidOpenRouterKeyException } from '../exceptions/index.js';

/** A provider API key in plain text. Lives only while it is encrypted or used. */
export class ApiKey {
  public static readonly MAX_LENGTH = 500;
  static readonly #HINT_LENGTH = 4;

  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed || /\s/.test(trimmed)) {
      throw new InvalidOpenRouterKeyException(
        'API key cannot be empty or contain spaces',
      );
    }
    if (trimmed.length > ApiKey.MAX_LENGTH) {
      throw new InvalidOpenRouterKeyException(
        `API key cannot be longer than ${ApiKey.MAX_LENGTH} characters`,
      );
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }

  /** The last characters: enough to tell keys apart, useless to an attacker. */
  public get hint(): string {
    return this.#value.slice(-ApiKey.#HINT_LENGTH);
  }

  /** Keeps the key out of logs and error reports. */
  public toJSON(): string {
    return `…${this.hint}`;
  }
}
