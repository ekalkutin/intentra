import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of a Product Overview; its summary is the main field. */
export class ProductOverviewContent {
  readonly #summary: KnowledgeText;
  readonly #problem: KnowledgeText | null;
  readonly #audience: KnowledgeText | null;
  readonly #value: KnowledgeText | null;

  constructor(props: ProductOverviewFields) {
    this.#summary = new KnowledgeText(props.summary);
    this.#problem = KnowledgeText.optional(props.problem);
    this.#audience = KnowledgeText.optional(props.audience);
    this.#value = KnowledgeText.optional(props.value);
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.ProductOverview;
  }

  get mainField(): KnowledgeText {
    return this.#summary;
  }

  public toFields(): ProductOverviewFields {
    return {
      summary: this.#summary.value,
      problem: this.#problem?.value ?? null,
      audience: this.#audience?.value ?? null,
      value: this.#value?.value ?? null,
    };
  }
}

export type ProductOverviewFields = {
  readonly summary: string;
  readonly problem: string | null;
  readonly audience: string | null;
  readonly value: string | null;
};
