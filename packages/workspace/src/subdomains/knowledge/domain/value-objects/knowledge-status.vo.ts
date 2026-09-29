import { UnknownKnowledgeStatusException } from '../exceptions/index.js';

/** Where a Knowledge Item is in its lifecycle; for now every one is a Draft. */
export class KnowledgeStatus {
  public static readonly Draft = new KnowledgeStatus('draft');

  static readonly #all: readonly KnowledgeStatus[] = [KnowledgeStatus.Draft];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): KnowledgeStatus {
    const status = KnowledgeStatus.#all.find(
      candidate => candidate.value === value,
    );
    if (!status) {
      throw new UnknownKnowledgeStatusException();
    }

    return status;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: KnowledgeStatus): boolean {
    return other.value === this.#value;
  }
}
