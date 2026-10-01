import {
  SkillDescription,
  SkillId,
  SkillInstructions,
  SkillName,
} from '../value-objects/index.js';

import type { Comparable } from './changed-fields.js';

export type SkillSpec = {
  readonly name: SkillName;
  readonly description: SkillDescription;
  readonly instructions: SkillInstructions;
};

/** One of Intentra's own Skills, which a Workspace cannot change or remove. */
export class Skill {
  readonly #id: SkillId;
  readonly #spec: SkillSpec;

  private constructor(id: SkillId, spec: SkillSpec) {
    this.#id = id;
    this.#spec = spec;
  }

  get id(): SkillId {
    return this.#id;
  }

  get name(): SkillName {
    return this.#spec.name;
  }

  get description(): SkillDescription {
    return this.#spec.description;
  }

  get instructions(): SkillInstructions {
    return this.#spec.instructions;
  }

  public static create(id: SkillId, spec: SkillSpec): Skill {
    return new Skill(id, spec);
  }

  public static restore(props: SkillRestoreProps): Skill {
    return new Skill(new SkillId(props.id), {
      name: new SkillName(props.name),
      description: new SkillDescription(props.description),
      instructions: new SkillInstructions(props.instructions),
    });
  }

  public with(spec: SkillSpec): Skill {
    return new Skill(this.#id, spec);
  }

  public toComparable(): Comparable {
    return {
      name: this.name.value,
      description: this.description.value,
      instructions: this.instructions.value,
    };
  }
}

type SkillRestoreProps = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
};
