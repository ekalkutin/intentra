import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of an Open Question; the question is the main and only field. */
export class OpenQuestionContent {
  readonly #question: KnowledgeText;

  constructor(props: OpenQuestionFields) {
    this.#question = new KnowledgeText(props.question);
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.OpenQuestion;
  }

  get mainField(): KnowledgeText {
    return this.#question;
  }

  public toFields(): OpenQuestionFields {
    return { question: this.#question.value };
  }
}

export type OpenQuestionFields = {
  readonly question: string;
};
