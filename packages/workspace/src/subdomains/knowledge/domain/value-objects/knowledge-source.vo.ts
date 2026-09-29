import { UnknownKnowledgeSourceException } from '../exceptions/index.js';

/** Where a Knowledge Item came from. Never changes. */
export class KnowledgeSource {
  public static readonly Manual = new KnowledgeSource('manual');
  public static readonly ExternalAgent = new KnowledgeSource('external-agent');

  static readonly #all: readonly KnowledgeSource[] = [
    KnowledgeSource.Manual,
    KnowledgeSource.ExternalAgent,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): KnowledgeSource {
    const source = KnowledgeSource.#all.find(
      candidate => candidate.value === value,
    );
    if (!source) {
      throw new UnknownKnowledgeSourceException();
    }

    return source;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: KnowledgeSource): boolean {
    return other.value === this.#value;
  }

  /** Unless entered by hand, a Knowledge Item always says what it rests on. */
  public requiresRationale(): boolean {
    return !this.equals(KnowledgeSource.Manual);
  }
}
