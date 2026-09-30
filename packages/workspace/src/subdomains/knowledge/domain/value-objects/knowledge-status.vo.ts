import { UnknownKnowledgeStatusException } from '../exceptions/index.js';

/** Where a Knowledge Item is in its lifecycle. */
export class KnowledgeStatus {
  public static readonly Draft = new KnowledgeStatus('draft');
  public static readonly Approved = new KnowledgeStatus('approved');
  public static readonly Rejected = new KnowledgeStatus('rejected');
  public static readonly Obsolete = new KnowledgeStatus('obsolete');

  static readonly #all: readonly KnowledgeStatus[] = [
    KnowledgeStatus.Draft,
    KnowledgeStatus.Approved,
    KnowledgeStatus.Rejected,
    KnowledgeStatus.Obsolete,
  ];

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
