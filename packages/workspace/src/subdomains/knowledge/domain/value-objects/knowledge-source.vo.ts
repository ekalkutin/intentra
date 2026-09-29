import { UnknownKnowledgeSourceException } from '../exceptions/index.js';

/** Where a Knowledge Item came from; for now only entered by hand. Never changes. */
export class KnowledgeSource {
  public static readonly Manual = new KnowledgeSource('manual');

  static readonly #all: readonly KnowledgeSource[] = [KnowledgeSource.Manual];

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
}
