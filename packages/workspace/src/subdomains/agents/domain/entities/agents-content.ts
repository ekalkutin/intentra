import { AgentsChangeKind, type ToolName } from '../value-objects/index.js';

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

  get agents(): readonly Agent[] {
    return this.#agents;
  }

  get skills(): readonly Skill[] {
    return this.#skills;
  }

  get modelProfiles(): readonly ModelProfile[] {
    return this.#modelProfiles;
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

  /** What keeps this from being published, in words; empty when nothing does. */
  public problems(availableTools: readonly ToolName[]): string[] {
    const problems: string[] = [];
    const orchestrators = this.#agents.filter(agent => agent.isOrchestrator());
    if (orchestrators.length !== 1) {
      problems.push(
        `there must be exactly one Orchestrator, not ${orchestrators.length}`,
      );
    }
    const skillNames = this.#skills.map(skill => skill.name.value);
    for (const name of new Set(skillNames)) {
      if (skillNames.filter(other => other === name).length > 1) {
        problems.push(`more than one Skill is called "${name}"`);
      }
    }
    for (const agent of this.#agents) {
      const name = agent.name.value;
      for (const tool of agent.tools) {
        if (!availableTools.some(available => available.equals(tool))) {
          problems.push(
            `${name} uses the tool ${tool.value}, which the code no longer has`,
          );
        }
      }
      if (
        !agent.skillIds.every(id =>
          this.#skills.some(skill => skill.id.equals(id)),
        )
      ) {
        problems.push(`${name} uses a Skill that does not exist`);
      }
      if (
        !this.#modelProfiles.some(profile =>
          profile.id.equals(agent.modelProfileId),
        )
      ) {
        problems.push(`${name} is on a Model Profile that does not exist`);
      }
      if (!agent.isOrchestrator() && agent.specialistIds.length > 0) {
        problems.push(`${name} is a Specialist and cannot call other Agents`);
      }
      const callable = agent.specialistIds.every(id =>
        this.#agents.some(
          other => other.id.equals(id) && !other.isOrchestrator(),
        ),
      );
      if (!callable) {
        problems.push(`${name} may call an Agent that is not a Specialist`);
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
