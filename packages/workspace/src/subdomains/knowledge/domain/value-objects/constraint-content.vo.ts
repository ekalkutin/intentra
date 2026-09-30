import { ConstraintOrigin } from './constraint-origin.vo.js';
import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of a Constraint; the constraint itself is the main field. */
export class ConstraintContent {
  readonly #constraint: KnowledgeText;
  readonly #imposedBy: ConstraintOrigin | null;

  constructor(props: ConstraintFields) {
    this.#constraint = new KnowledgeText(props.constraint);
    this.#imposedBy =
      props.imposedBy === null ? null : ConstraintOrigin.from(props.imposedBy);
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Constraint;
  }

  get mainField(): KnowledgeText {
    return this.#constraint;
  }

  public toFields(): ConstraintFields {
    return {
      constraint: this.#constraint.value,
      imposedBy: this.#imposedBy?.value ?? null,
    };
  }
}

export type ConstraintFields = {
  readonly constraint: string;
  readonly imposedBy: string | null;
};
