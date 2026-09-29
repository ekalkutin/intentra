import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';
import { RequirementPriority } from './requirement-priority.vo.js';
import { RequirementType } from './requirement-type.vo.js';

/** The fields of a Requirement; its statement is the main field. */
export class RequirementContent {
  readonly #statement: KnowledgeText;
  readonly #type: RequirementType | null;
  readonly #priority: RequirementPriority | null;
  readonly #acceptanceCriteria: readonly KnowledgeText[];

  constructor(props: RequirementFields) {
    this.#statement = new KnowledgeText(props.statement);
    this.#type = props.type === null ? null : RequirementType.from(props.type);
    this.#priority =
      props.priority === null ? null : RequirementPriority.from(props.priority);
    this.#acceptanceCriteria = props.acceptanceCriteria.map(
      criterion => new KnowledgeText(criterion),
    );
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Requirement;
  }

  get mainField(): KnowledgeText {
    return this.#statement;
  }

  /** What the system does or what quality it has. */
  get statement(): KnowledgeText {
    return this.#statement;
  }

  get type(): RequirementType | null {
    return this.#type;
  }

  get priority(): RequirementPriority | null {
    return this.#priority;
  }

  get acceptanceCriteria(): readonly KnowledgeText[] {
    return this.#acceptanceCriteria;
  }

  public toFields(): RequirementFields {
    return {
      statement: this.#statement.value,
      type: this.#type?.value ?? null,
      priority: this.#priority?.value ?? null,
      acceptanceCriteria: this.#acceptanceCriteria.map(
        criterion => criterion.value,
      ),
    };
  }
}

export type RequirementFields = {
  readonly statement: string;
  readonly type: string | null;
  readonly priority: string | null;
  readonly acceptanceCriteria: readonly string[];
};
