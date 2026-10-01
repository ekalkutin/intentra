import { InvalidAgentException } from '../exceptions/index.js';

/** Whether an Agent is the one people talk to or one it hands work to. */
export class AgentRole {
  public static readonly Orchestrator = new AgentRole('orchestrator');
  public static readonly Specialist = new AgentRole('specialist');

  static readonly #all: readonly AgentRole[] = [
    AgentRole.Orchestrator,
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
        'Agent role must be orchestrator or specialist',
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
