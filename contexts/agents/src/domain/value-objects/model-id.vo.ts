import { InvalidAgentProfileException } from '../exceptions/index.js';

/** The OpenRouter model an agent runs on, such as `anthropic/claude-sonnet-4.5`. */
export class ModelId {
  public static readonly MAX_LENGTH = 200;
  static readonly #FORMAT = /^\S+\/\S+$/;

  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!ModelId.#FORMAT.test(trimmed) || trimmed.length > ModelId.MAX_LENGTH) {
      throw new InvalidAgentProfileException(
        `Model id must look like vendor/model: ${value}`,
      );
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: ModelId): boolean {
    return other.value === this.#value;
  }
}
