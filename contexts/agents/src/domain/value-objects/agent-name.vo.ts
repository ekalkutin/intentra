import { InvalidAgentProfileException } from '../exceptions/index.js';

export class AgentName {
  public static readonly MAX_LENGTH = 80;

  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new InvalidAgentProfileException('Agent name cannot be empty');
    }
    if (trimmed.length > AgentName.MAX_LENGTH) {
      throw new InvalidAgentProfileException(
        `Agent name cannot be longer than ${AgentName.MAX_LENGTH} characters`,
      );
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: AgentName): boolean {
    return other.value === this.#value;
  }
}
