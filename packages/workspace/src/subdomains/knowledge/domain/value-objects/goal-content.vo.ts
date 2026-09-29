import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of a Goal; its outcome is the main field. */
export class GoalContent {
  readonly #outcome: KnowledgeText;
  readonly #successMetric: KnowledgeText | null;

  constructor(props: GoalFields) {
    this.#outcome = new KnowledgeText(props.outcome);
    this.#successMetric = KnowledgeText.optional(props.successMetric);
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Goal;
  }

  get mainField(): KnowledgeText {
    return this.#outcome;
  }

  public toFields(): GoalFields {
    return {
      outcome: this.#outcome.value,
      successMetric: this.#successMetric?.value ?? null,
    };
  }
}

export type GoalFields = {
  readonly outcome: string;
  readonly successMetric: string | null;
};
