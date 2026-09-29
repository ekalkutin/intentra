import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of a Business Rule; the rule is the main and only field. */
export class BusinessRuleContent {
  readonly #rule: KnowledgeText;

  constructor(props: BusinessRuleFields) {
    this.#rule = new KnowledgeText(props.rule);
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.BusinessRule;
  }

  get mainField(): KnowledgeText {
    return this.#rule;
  }

  public toFields(): BusinessRuleFields {
    return { rule: this.#rule.value };
  }
}

export type BusinessRuleFields = {
  readonly rule: string;
};
