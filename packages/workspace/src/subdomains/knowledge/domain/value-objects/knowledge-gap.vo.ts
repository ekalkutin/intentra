import type { KnowledgeGapRule } from './knowledge-gap-rule.vo.js';
import type { KnowledgeKey } from './knowledge-key.vo.js';

/**
 * Something missing from a Project's knowledge that needs no judgement to
 * see. Never stored: found anew from the knowledge each time.
 */
export class KnowledgeGap {
  readonly #rule: KnowledgeGapRule;
  readonly #key: KnowledgeKey | null;

  constructor(rule: KnowledgeGapRule, key: KnowledgeKey | null) {
    this.#rule = rule;
    this.#key = key;
  }

  get rule(): KnowledgeGapRule {
    return this.#rule;
  }

  /** The item it is about; `null` for a Gap of the Project as a whole. */
  get key(): KnowledgeKey | null {
    return this.#key;
  }
}
