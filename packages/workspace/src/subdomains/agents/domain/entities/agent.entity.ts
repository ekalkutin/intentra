import {
  AgentDescription,
  AgentId,
  AgentInstructions,
  AgentName,
  AgentRole,
  ModelProfileId,
  SkillId,
  ToolName,
} from '../value-objects/index.js';

import type { Comparable } from './changed-fields.js';

/** What a Platform Admin sets on an Agent; its id and role never change. */
export type AgentSpec = {
  readonly name: AgentName;
  readonly description: AgentDescription;
  readonly instructions: AgentInstructions;
  readonly tools: readonly ToolName[];
  readonly skillIds: readonly SkillId[];
  readonly modelProfileId: ModelProfileId;
  /** The Specialists Intentra may call; empty for a Specialist. */
  readonly specialistIds: readonly AgentId[];
};

/** One of Intentra's Agents as designed, within the Unpublished Agents or an Agents Version. */
export class Agent {
  readonly #id: AgentId;
  readonly #role: AgentRole;
  readonly #spec: AgentSpec;

  private constructor(id: AgentId, role: AgentRole, spec: AgentSpec) {
    this.#id = id;
    this.#role = role;
    this.#spec = {
      ...spec,
      tools: unique(spec.tools, tool => tool.value),
      skillIds: unique(spec.skillIds, id => id.value),
      specialistIds: unique(spec.specialistIds, id => id.value),
    };
  }

  get id(): AgentId {
    return this.#id;
  }

  get role(): AgentRole {
    return this.#role;
  }

  get name(): AgentName {
    return this.#spec.name;
  }

  get description(): AgentDescription {
    return this.#spec.description;
  }

  get instructions(): AgentInstructions {
    return this.#spec.instructions;
  }

  get tools(): readonly ToolName[] {
    return this.#spec.tools;
  }

  get skillIds(): readonly SkillId[] {
    return this.#spec.skillIds;
  }

  get modelProfileId(): ModelProfileId {
    return this.#spec.modelProfileId;
  }

  get specialistIds(): readonly AgentId[] {
    return this.#spec.specialistIds;
  }

  public static create(id: AgentId, role: AgentRole, spec: AgentSpec): Agent {
    return new Agent(id, role, spec);
  }

  public static restore(props: AgentRestoreProps): Agent {
    return new Agent(new AgentId(props.id), AgentRole.from(props.role), {
      name: new AgentName(props.name),
      description: new AgentDescription(props.description),
      instructions: new AgentInstructions(props.instructions),
      tools: props.tools.map(tool => new ToolName(tool)),
      skillIds: props.skillIds.map(id => new SkillId(id)),
      modelProfileId: new ModelProfileId(props.modelProfileId),
      specialistIds: props.specialistIds.map(id => new AgentId(id)),
    });
  }

  public isIntentra(): boolean {
    return this.#role.equals(AgentRole.Intentra);
  }

  public isAuditor(): boolean {
    return this.#role.equals(AgentRole.Auditor);
  }

  public isSpecialist(): boolean {
    return this.#role.equals(AgentRole.Specialist);
  }

  public with(spec: AgentSpec): Agent {
    return new Agent(this.#id, this.#role, spec);
  }

  public usesSkill(skillId: SkillId): boolean {
    return this.#spec.skillIds.some(id => id.equals(skillId));
  }

  public withoutSkill(skillId: SkillId): Agent {
    return this.with({
      ...this.#spec,
      skillIds: this.#spec.skillIds.filter(id => !id.equals(skillId)),
    });
  }

  public withoutSpecialist(agentId: AgentId): Agent {
    return this.with({
      ...this.#spec,
      specialistIds: this.#spec.specialistIds.filter(id => !id.equals(agentId)),
    });
  }

  public toComparable(): Comparable {
    return {
      name: this.name.value,
      description: this.description.value,
      instructions: this.instructions.value,
      tools: this.tools.map(tool => tool.value),
      skillIds: this.skillIds.map(id => id.value),
      modelProfileId: this.modelProfileId.value,
      specialistIds: this.specialistIds.map(id => id.value),
    };
  }
}

function unique<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();

  return items.filter(item => !seen.has(key(item)) && seen.add(key(item)));
}

type AgentRestoreProps = {
  readonly id: string;
  readonly role: string;
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
  readonly tools: readonly string[];
  readonly skillIds: readonly string[];
  readonly modelProfileId: string;
  readonly specialistIds: readonly string[];
};
