import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of a Scenario; its expected result is the main field. */
export class ScenarioContent {
  readonly #expectedResult: KnowledgeText;
  readonly #steps: readonly KnowledgeText[];

  constructor(props: ScenarioFields) {
    this.#expectedResult = new KnowledgeText(props.expectedResult);
    this.#steps = props.steps.map(step => new KnowledgeText(step));
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Scenario;
  }

  get mainField(): KnowledgeText {
    return this.#expectedResult;
  }

  public toFields(): ScenarioFields {
    return {
      expectedResult: this.#expectedResult.value,
      steps: this.#steps.map(step => step.value),
    };
  }
}

export type ScenarioFields = {
  readonly expectedResult: string;
  readonly steps: readonly string[];
};
