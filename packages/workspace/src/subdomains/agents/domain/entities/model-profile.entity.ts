import {
  MaxOutputTokens,
  ModelId,
  ModelProfileId,
  ModelProfileName,
  ReasoningEffort,
  Temperature,
} from '../value-objects/index.js';

import type { Comparable } from './changed-fields.js';

/** Null tuning means the model's own default. */
export type ModelProfileSpec = {
  readonly name: ModelProfileName;
  readonly modelId: ModelId;
  readonly temperature: Temperature | null;
  readonly reasoningEffort: ReasoningEffort | null;
  readonly maxOutputTokens: MaxOutputTokens | null;
};

/** One of Intentra's built-in Model Profiles, such as "Fast" or "Smart". */
export class ModelProfile {
  readonly #id: ModelProfileId;
  readonly #spec: ModelProfileSpec;

  private constructor(id: ModelProfileId, spec: ModelProfileSpec) {
    this.#id = id;
    this.#spec = spec;
  }

  get id(): ModelProfileId {
    return this.#id;
  }

  get name(): ModelProfileName {
    return this.#spec.name;
  }

  get modelId(): ModelId {
    return this.#spec.modelId;
  }

  get temperature(): Temperature | null {
    return this.#spec.temperature;
  }

  get reasoningEffort(): ReasoningEffort | null {
    return this.#spec.reasoningEffort;
  }

  get maxOutputTokens(): MaxOutputTokens | null {
    return this.#spec.maxOutputTokens;
  }

  public static create(
    id: ModelProfileId,
    spec: ModelProfileSpec,
  ): ModelProfile {
    return new ModelProfile(id, spec);
  }

  public static restore(props: ModelProfileRestoreProps): ModelProfile {
    return new ModelProfile(new ModelProfileId(props.id), {
      name: new ModelProfileName(props.name),
      modelId: new ModelId(props.modelId),
      temperature:
        props.temperature === null ? null : new Temperature(props.temperature),
      reasoningEffort:
        props.reasoningEffort === null
          ? null
          : ReasoningEffort.from(props.reasoningEffort),
      maxOutputTokens:
        props.maxOutputTokens === null
          ? null
          : new MaxOutputTokens(props.maxOutputTokens),
    });
  }

  public with(spec: ModelProfileSpec): ModelProfile {
    return new ModelProfile(this.#id, spec);
  }

  public toComparable(): Comparable {
    return {
      name: this.name.value,
      modelId: this.modelId.value,
      temperature: this.temperature?.value ?? null,
      reasoningEffort: this.reasoningEffort?.value ?? null,
      maxOutputTokens: this.maxOutputTokens?.value ?? null,
    };
  }
}

type ModelProfileRestoreProps = {
  readonly id: string;
  readonly name: string;
  readonly modelId: string;
  readonly temperature: number | null;
  readonly reasoningEffort: string | null;
  readonly maxOutputTokens: number | null;
};
