import { InvalidAgentProfileException } from '../exceptions/index.js';

type AgentRoleValue = 'orchestrator' | 'specialist';

/**
 * What an agent does in its workspace. The orchestrator talks to people and
 * delegates; specialists do what it delegates to them.
 */
export class AgentRole {
  public static readonly ORCHESTRATOR = new AgentRole('orchestrator');
  public static readonly SPECIALIST = new AgentRole('specialist');

  static readonly #ALL = [AgentRole.ORCHESTRATOR, AgentRole.SPECIALIST];

  private constructor(public readonly value: AgentRoleValue) {}

  public static from(value: string): AgentRole {
    const role = AgentRole.#ALL.find(role => role.value === value);
    if (!role) {
      throw new InvalidAgentProfileException(`Unknown agent role: ${value}`);
    }
    return role;
  }

  public get isOrchestrator(): boolean {
    return this === AgentRole.ORCHESTRATOR;
  }

  public equals(other: AgentRole): boolean {
    return other.value === this.value;
  }
}
