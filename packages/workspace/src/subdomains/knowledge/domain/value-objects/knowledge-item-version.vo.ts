import { InvalidKnowledgeItemVersionException } from '../exceptions/index.js';

/** Raised by every change, so that a change made on an older version can be refused. */
export class KnowledgeItemVersion {
  public static readonly First = new KnowledgeItemVersion(1);

  readonly #value: number;

  constructor(value: number) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new InvalidKnowledgeItemVersionException();
    }
    this.#value = value;
  }

  public get value(): number {
    return this.#value;
  }

  public next(): KnowledgeItemVersion {
    return new KnowledgeItemVersion(this.#value + 1);
  }

  public equals(other: KnowledgeItemVersion): boolean {
    return other.value === this.#value;
  }
}
