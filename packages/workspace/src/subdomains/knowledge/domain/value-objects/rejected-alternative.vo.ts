import { KnowledgeText } from './knowledge-text.vo.js';

/** An option a Decision turned down, and why. */
export class RejectedAlternative {
  readonly #alternative: KnowledgeText;
  readonly #reason: KnowledgeText | null;

  constructor(props: RejectedAlternativeProps) {
    this.#alternative = new KnowledgeText(props.alternative);
    this.#reason = KnowledgeText.optional(props.reason);
  }

  get alternative(): KnowledgeText {
    return this.#alternative;
  }

  /** Null until someone says why it was turned down. */
  get reason(): KnowledgeText | null {
    return this.#reason;
  }
}

type RejectedAlternativeProps = {
  readonly alternative: string;
  readonly reason: string | null;
};
