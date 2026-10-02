import { InvalidAgentException } from '../exceptions/index.js';

/**
 * Whether an Agent is the one people talk to, the one that carries out
 * Analysis Runs, or one Intentra hands work to.
 */
export class AgentRole {
  public static readonly Intentra = new AgentRole('intentra');
  public static readonly Auditor = new AgentRole('auditor');
  public static readonly Specialist = new AgentRole('specialist');

  static readonly #all: readonly AgentRole[] = [
    AgentRole.Intentra,
    AgentRole.Auditor,
    AgentRole.Specialist,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): AgentRole {
    const role = AgentRole.#all.find(candidate => candidate.value === value);
    if (!role) {
      throw new InvalidAgentException(
        'Agent role must be intentra, auditor or specialist',
      );
    }

    return role;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: AgentRole): boolean {
    return other.value === this.#value;
  }
}
