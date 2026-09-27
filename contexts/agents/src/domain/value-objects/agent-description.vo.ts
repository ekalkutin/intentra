import { InvalidAgentProfileException } from '../exceptions/index.js';

/**
 * What an agent is good at. The orchestrator reads it to decide whom to
 * delegate to, so it is required.
 */
export class AgentDescription {
  public static readonly MAX_LENGTH = 1000;

  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new InvalidAgentProfileException(
        'Agent description cannot be empty',
      );
    }
    if (trimmed.length > AgentDescription.MAX_LENGTH) {
      throw new InvalidAgentProfileException(
        `Agent description cannot be longer than ${AgentDescription.MAX_LENGTH} characters`,
      );
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: AgentDescription): boolean {
    return other.value === this.#value;
  }
}
