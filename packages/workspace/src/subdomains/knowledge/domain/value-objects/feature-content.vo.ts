import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of a Feature; its capability is the main field. */
export class FeatureContent {
  readonly #capability: KnowledgeText;
  readonly #outOfScope: readonly KnowledgeText[];

  constructor(props: FeatureFields) {
    this.#capability = new KnowledgeText(props.capability);
    this.#outOfScope = props.outOfScope.map(item => new KnowledgeText(item));
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Feature;
  }

  get mainField(): KnowledgeText {
    return this.#capability;
  }

  /** What the Feature deliberately does not do. */
  get outOfScope(): readonly KnowledgeText[] {
    return this.#outOfScope;
  }

  public toFields(): FeatureFields {
    return {
      capability: this.#capability.value,
      outOfScope: this.#outOfScope.map(item => item.value),
    };
  }
}

export type FeatureFields = {
  readonly capability: string;
  readonly outOfScope: readonly string[];
};
