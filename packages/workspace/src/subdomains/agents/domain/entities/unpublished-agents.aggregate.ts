import { Aggregate } from '@intentra/shared-kernel';

import {
  AgentNotFoundException,
  IntentraExistsException,
  IntentraNotRemovableException,
  InvalidAgentException,
  ModelProfileInUseException,
  ModelProfileNotFoundException,
  SkillNameTakenException,
  SkillNotFoundException,
} from '../exceptions/index.js';
import {
  AgentId,
  AgentRole,
  ModelProfileId,
  SkillId,
  ToolName,
  UnpublishedAgentsId,
} from '../value-objects/index.js';

import { Agent, type AgentSpec } from './agent.entity.js';
import { AgentsContent } from './agents-content.js';
import { ModelProfile, type ModelProfileSpec } from './model-profile.entity.js';
import { Skill, type SkillSpec } from './skill.entity.js';

/**
 * The one set of Agents a Platform Admin is still editing, one object at a
 * time. Each change checks only itself; publishing checks the whole.
 */
export class UnpublishedAgents extends Aggregate<UnpublishedAgentsId> {
  #content: AgentsContent;

  private constructor(id: UnpublishedAgentsId, state: UnpublishedAgentsState) {
    super(id);
    this.#content = state.content;
  }

  get content(): AgentsContent {
    return this.#content;
  }

  /** Nothing yet: a Platform Admin creates Intentra and the rest. */
  public static empty(): UnpublishedAgents {
    return new UnpublishedAgents(new UnpublishedAgentsId(), {
      content: AgentsContent.empty(),
    });
  }

  public static restore(
    props: UnpublishedAgentsRestoreProps,
  ): UnpublishedAgents {
    return new UnpublishedAgents(new UnpublishedAgentsId(props.id), {
      content: props.content,
    });
  }

  /** Any number of Specialists, but only one Intentra. */
  public addAgent(
    role: AgentRole,
    spec: AgentSpec,
    availableTools: readonly ToolName[],
  ): Agent {
    const agent = Agent.create(new AgentId(), role, spec);
    if (
      agent.isIntentra() &&
      this.#content.agents.some(other => other.isIntentra())
    ) {
      throw new IntentraExistsException();
    }
    this.ensureSound(agent, availableTools);
    this.replace({ agents: [...this.#content.agents, agent] });

    return agent;
  }

  public editAgent(
    id: AgentId,
    spec: AgentSpec,
    availableTools: readonly ToolName[],
  ): Agent {
    const agent = this.getAgent(id).with(spec);
    this.ensureSound(agent, availableTools);
    this.replace({
      agents: this.#content.agents.map(other =>
        other.id.equals(id) ? agent : other,
      ),
    });

    return agent;
  }

  /** Intentra stops calling the removed Specialist. */
  public removeAgent(id: AgentId): void {
    if (this.getAgent(id).isIntentra()) {
      throw new IntentraNotRemovableException();
    }
    this.replace({
      agents: this.#content.agents
        .filter(agent => !agent.id.equals(id))
        .map(agent => agent.withoutSpecialist(id)),
    });
  }

  public addSkill(spec: SkillSpec): Skill {
    this.ensureSkillNameFree(spec, null);
    const skill = Skill.create(new SkillId(), spec);
    this.replace({ skills: [...this.#content.skills, skill] });

    return skill;
  }

  public editSkill(id: SkillId, spec: SkillSpec): Skill {
    const skill = this.getSkill(id).with(spec);
    this.ensureSkillNameFree(spec, id);
    this.replace({
      skills: this.#content.skills.map(other =>
        other.id.equals(id) ? skill : other,
      ),
    });

    return skill;
  }

  /** Every Agent that had the Skill loses it. */
  public removeSkill(id: SkillId): void {
    this.getSkill(id);
    this.replace({
      skills: this.#content.skills.filter(skill => !skill.id.equals(id)),
      agents: this.#content.agents.map(agent => agent.withoutSkill(id)),
    });
  }

  public addModelProfile(spec: ModelProfileSpec): ModelProfile {
    const profile = ModelProfile.create(new ModelProfileId(), spec);
    this.replace({ modelProfiles: [...this.#content.modelProfiles, profile] });

    return profile;
  }

  public editModelProfile(
    id: ModelProfileId,
    spec: ModelProfileSpec,
  ): ModelProfile {
    const profile = this.getModelProfile(id).with(spec);
    this.replace({
      modelProfiles: this.#content.modelProfiles.map(other =>
        other.id.equals(id) ? profile : other,
      ),
    });

    return profile;
  }

  /** Refused while any Agent is on it. */
  public removeModelProfile(id: ModelProfileId): void {
    this.getModelProfile(id);
    const users = this.#content.agents.filter(agent =>
      agent.modelProfileId.equals(id),
    );
    if (users.length > 0) {
      throw new ModelProfileInUseException(
        users.map(agent => agent.name.value),
      );
    }
    this.replace({
      modelProfiles: this.#content.modelProfiles.filter(
        profile => !profile.id.equals(id),
      ),
    });
  }

  /** Replaces everything, such as with an earlier Agents Version to publish again. */
  public resetTo(content: AgentsContent): void {
    this.#content = content;
  }

  public getAgent(id: AgentId): Agent {
    const agent = this.#content.agents.find(candidate =>
      candidate.id.equals(id),
    );
    if (!agent) {
      throw new AgentNotFoundException();
    }

    return agent;
  }

  private getSkill(id: SkillId): Skill {
    const skill = this.#content.skills.find(candidate =>
      candidate.id.equals(id),
    );
    if (!skill) {
      throw new SkillNotFoundException();
    }

    return skill;
  }

  private getModelProfile(id: ModelProfileId): ModelProfile {
    const profile = this.#content.modelProfiles.find(candidate =>
      candidate.id.equals(id),
    );
    if (!profile) {
      throw new ModelProfileNotFoundException();
    }

    return profile;
  }

  /** Every tool in the code, and every Skill, Model Profile and Specialist it names present. */
  private ensureSound(agent: Agent, availableTools: readonly ToolName[]): void {
    const unknownTool = agent.tools.find(
      tool => !availableTools.some(available => available.equals(tool)),
    );
    if (unknownTool) {
      throw new InvalidAgentException(`There is no tool ${unknownTool.value}`);
    }
    for (const skillId of agent.skillIds) {
      this.getSkill(skillId);
    }
    this.getModelProfile(agent.modelProfileId);
    if (!agent.isIntentra() && agent.specialistIds.length > 0) {
      throw new InvalidAgentException('A Specialist cannot call other Agents');
    }
    for (const specialistId of agent.specialistIds) {
      const specialist = this.#content.agents.find(candidate =>
        candidate.id.equals(specialistId),
      );
      if (!specialist || specialist.isIntentra()) {
        throw new InvalidAgentException('Intentra may call only Specialists');
      }
    }
  }

  private ensureSkillNameFree(spec: SkillSpec, own: SkillId | null): void {
    const taken = this.#content.skills.some(
      skill => skill.name.equals(spec.name) && !(own && skill.id.equals(own)),
    );
    if (taken) {
      throw new SkillNameTakenException(spec.name.value);
    }
  }

  private replace(parts: {
    readonly agents?: readonly Agent[];
    readonly skills?: readonly Skill[];
    readonly modelProfiles?: readonly ModelProfile[];
  }): void {
    this.#content = new AgentsContent(
      parts.agents ?? this.#content.agents,
      parts.skills ?? this.#content.skills,
      parts.modelProfiles ?? this.#content.modelProfiles,
    );
  }
}

type UnpublishedAgentsState = {
  readonly content: AgentsContent;
};
type UnpublishedAgentsRestoreProps = {
  readonly id: string;
  readonly content: AgentsContent;
};
