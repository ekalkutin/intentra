import {
  AgentsChangeKind,
  PublishingProblem,
  type ToolName,
} from '../value-objects/index.js';

import { Agent } from './agent.entity.js';
import { changedFields, type Comparable } from './changed-fields.js';
import { ModelProfile } from './model-profile.entity.js';
import { Skill } from './skill.entity.js';

/** One object that differs between two sets of Agents. */
export type AgentsChange = {
  readonly id: string;
  readonly name: string;
  readonly kind: AgentsChangeKind;
  /** For a changed object, the fields that differ. */
  readonly fields: readonly string[];
};

export type AgentsChanges = {
  readonly agents: readonly AgentsChange[];
  readonly skills: readonly AgentsChange[];
  readonly modelProfiles: readonly AgentsChange[];
};

type Comparing = {
  readonly id: { readonly value: string };
  readonly name: { readonly value: string };
  toComparable(): Comparable;
};

/**
 * Everything that shapes how the Agents behave, taken as one whole: the
 * Agents, Intentra's own Skills and the built-in Model Profiles.
 */
export class AgentsContent {
  readonly #agents: readonly Agent[];
  readonly #skills: readonly Skill[];
  readonly #modelProfiles: readonly ModelProfile[];

  constructor(
    agents: readonly Agent[],
    skills: readonly Skill[],
    modelProfiles: readonly ModelProfile[],
  ) {
    this.#agents = agents;
    this.#skills = skills;
    this.#modelProfiles = modelProfiles;
  }

  /** No Agents, Skills or Model Profiles: where a Platform Admin starts. */
  public static empty(): AgentsContent {
    return new AgentsContent([], [], []);
  }

  get agents(): readonly Agent[] {
    return this.#agents;
  }

  get skills(): readonly Skill[] {
    return this.#skills;
  }

  get modelProfiles(): readonly ModelProfile[] {
    return this.#modelProfiles;
  }

  /** Null until a Platform Admin creates it. */
  public intentra(): Agent | null {
    return this.#agents.find(agent => agent.isIntentra()) ?? null;
  }

  /** Null until a Platform Admin creates it. */
  public auditor(): Agent | null {
    return this.#agents.find(agent => agent.isAuditor()) ?? null;
  }

  /** The Specialists the Agent may call. */
  public specialistsOf(agent: Agent): Agent[] {
    return this.#agents.filter(other =>
      agent.specialistIds.some(id => id.equals(other.id)),
    );
  }

  public skillsOf(agent: Agent): Skill[] {
    return this.#skills.filter(skill =>
      agent.skillIds.some(id => id.equals(skill.id)),
    );
  }

  /** Null only for content that could not be published. */
  public modelProfileOf(agent: Agent): ModelProfile | null {
    return (
      this.#modelProfiles.find(profile =>
        profile.id.equals(agent.modelProfileId),
      ) ?? null
    );
  }

  /** Object by object, what this has that `earlier` does not, or has otherwise. */
  public changesSince(earlier: AgentsContent): AgentsChanges {
    return {
      agents: diff(this.#agents, earlier.agents),
      skills: diff(this.#skills, earlier.skills),
      modelProfiles: diff(this.#modelProfiles, earlier.modelProfiles),
    };
  }

  public isSameAs(other: AgentsContent): boolean {
    const changes = this.changesSince(other);

    return (
      changes.agents.length === 0 &&
      changes.skills.length === 0 &&
      changes.modelProfiles.length === 0
    );
  }

  /** What keeps this from being published; empty when nothing does. */
  public problems(availableTools: readonly ToolName[]): PublishingProblem[] {
    const problems: PublishingProblem[] = [];
    const intentras = this.#agents.filter(agent => agent.isIntentra());
    if (intentras.length !== 1) {
      problems.push(PublishingProblem.intentraCount());
    }
    if (this.#agents.filter(agent => agent.isAuditor()).length !== 1) {
      problems.push(PublishingProblem.auditorCount());
    }
    const skillNames = this.#skills.map(skill => skill.name.value);
    for (const name of new Set(skillNames)) {
      if (skillNames.filter(other => other === name).length > 1) {
        problems.push(PublishingProblem.duplicateSkillName(name));
      }
    }
    for (const agent of this.#agents) {
      const subject = { id: agent.id.value, name: agent.name.value };
      for (const tool of agent.tools) {
        if (!availableTools.some(available => available.equals(tool))) {
          problems.push(PublishingProblem.toolUnavailable(subject, tool.value));
        }
      }
      if (
        !agent.skillIds.every(id =>
          this.#skills.some(skill => skill.id.equals(id)),
        )
      ) {
        problems.push(PublishingProblem.skillMissing(subject));
      }
      if (
        !this.#modelProfiles.some(profile =>
          profile.id.equals(agent.modelProfileId),
        )
      ) {
        problems.push(PublishingProblem.modelProfileMissing(subject));
      }
      if (!agent.isIntentra() && agent.specialistIds.length > 0) {
        problems.push(PublishingProblem.specialistCallsAgents(subject));
      }
      const callable = agent.specialistIds.every(id =>
        this.#agents.some(other => other.id.equals(id) && other.isSpecialist()),
      );
      if (!callable) {
        problems.push(PublishingProblem.callsNonSpecialist(subject));
      }
    }

    return problems;
  }
}

function diff(
  current: readonly Comparing[],
  earlier: readonly Comparing[],
): AgentsChange[] {
  const changes: AgentsChange[] = [];
  for (const item of current) {
    const before = earlier.find(other => other.id.value === item.id.value);
    if (!before) {
      changes.push({
        id: item.id.value,
        name: item.name.value,
        kind: AgentsChangeKind.Added,
        fields: [],
      });
      continue;
    }
    const fields = changedFields(item.toComparable(), before.toComparable());
    if (fields.length > 0) {
      changes.push({
        id: item.id.value,
        name: item.name.value,
        kind: AgentsChangeKind.Changed,
        fields,
      });
    }
  }
  for (const before of earlier) {
    if (!current.some(item => item.id.value === before.id.value)) {
      changes.push({
        id: before.id.value,
        name: before.name.value,
        kind: AgentsChangeKind.Removed,
        fields: [],
      });
    }
  }

  return changes;
}
