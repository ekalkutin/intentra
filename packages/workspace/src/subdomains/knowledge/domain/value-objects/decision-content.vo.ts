import { DecisionArea } from './decision-area.vo.js';
import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';
import { RejectedAlternative } from './rejected-alternative.vo.js';

/** The fields of a Decision; the decision itself is the main field. */
export class DecisionContent {
  readonly #decision: KnowledgeText;
  readonly #area: DecisionArea | null;
  readonly #context: KnowledgeText | null;
  readonly #rejectedAlternatives: readonly RejectedAlternative[];

  constructor(props: DecisionFields) {
    this.#decision = new KnowledgeText(props.decision);
    this.#area = props.area === null ? null : DecisionArea.from(props.area);
    this.#context = KnowledgeText.optional(props.context);
    this.#rejectedAlternatives = props.rejectedAlternatives.map(
      alternative => new RejectedAlternative(alternative),
    );
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Decision;
  }

  get mainField(): KnowledgeText {
    return this.#decision;
  }

  get decision(): KnowledgeText {
    return this.#decision;
  }

  get area(): DecisionArea | null {
    return this.#area;
  }

  get context(): KnowledgeText | null {
    return this.#context;
  }

  get rejectedAlternatives(): readonly RejectedAlternative[] {
    return this.#rejectedAlternatives;
  }

  public toFields(): DecisionFields {
    return {
      decision: this.#decision.value,
      area: this.#area?.value ?? null,
      context: this.#context?.value ?? null,
      rejectedAlternatives: this.#rejectedAlternatives.map(alternative => ({
        alternative: alternative.alternative.value,
        reason: alternative.reason?.value ?? null,
      })),
    };
  }
}

export type DecisionFields = {
  readonly decision: string;
  readonly area: string | null;
  readonly context: string | null;
  readonly rejectedAlternatives: readonly {
    readonly alternative: string;
    readonly reason: string | null;
  }[];
};
