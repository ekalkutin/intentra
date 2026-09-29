import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';
import { TermSort } from './term-sort.vo.js';

/** The fields of a Term; its definition is the main field. */
export class TermContent {
  readonly #definition: KnowledgeText;
  readonly #sort: TermSort | null;
  readonly #synonymsToAvoid: readonly KnowledgeText[];

  constructor(props: TermFields) {
    this.#definition = new KnowledgeText(props.definition);
    this.#sort = props.sort === null ? null : TermSort.from(props.sort);
    this.#synonymsToAvoid = props.synonymsToAvoid.map(
      synonym => new KnowledgeText(synonym),
    );
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Term;
  }

  get mainField(): KnowledgeText {
    return this.#definition;
  }

  get definition(): KnowledgeText {
    return this.#definition;
  }

  get sort(): TermSort | null {
    return this.#sort;
  }

  get synonymsToAvoid(): readonly KnowledgeText[] {
    return this.#synonymsToAvoid;
  }

  public toFields(): TermFields {
    return {
      definition: this.#definition.value,
      sort: this.#sort?.value ?? null,
      synonymsToAvoid: this.#synonymsToAvoid.map(synonym => synonym.value),
    };
  }
}

export type TermFields = {
  readonly definition: string;
  readonly sort: string | null;
  readonly synonymsToAvoid: readonly string[];
};
