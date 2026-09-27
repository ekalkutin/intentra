import { InvalidAgentProfileException } from '../exceptions/index.js';

/** The system instructions an agent runs with. */
export class Instructions {
  public static readonly MAX_LENGTH = 20_000;

  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new InvalidAgentProfileException('Instructions cannot be empty');
    }
    if (trimmed.length > Instructions.MAX_LENGTH) {
      throw new InvalidAgentProfileException(
        `Instructions cannot be longer than ${Instructions.MAX_LENGTH} characters`,
      );
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: Instructions): boolean {
    return other.value === this.#value;
  }
}
