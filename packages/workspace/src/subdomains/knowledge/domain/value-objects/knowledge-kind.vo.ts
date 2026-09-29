import { UnknownKnowledgeKindException } from '../exceptions/index.js';

/** What sort of knowledge a Knowledge Item holds; decides its fields and its Knowledge Key's prefix. */
export class KnowledgeKind {
  public static readonly Term = new KnowledgeKind('term', 'TERM');
  public static readonly Requirement = new KnowledgeKind('requirement', 'REQ');
  public static readonly Decision = new KnowledgeKind('decision', 'DEC');

  static readonly #all: readonly KnowledgeKind[] = [
    KnowledgeKind.Term,
    KnowledgeKind.Requirement,
    KnowledgeKind.Decision,
  ];

  readonly #value: string;
  readonly #prefix: string;

  private constructor(value: string, prefix: string) {
    this.#value = value;
    this.#prefix = prefix;
  }

  public static from(value: string): KnowledgeKind {
    const kind = KnowledgeKind.#all.find(
      candidate => candidate.value === value,
    );
    if (!kind) {
      throw new UnknownKnowledgeKindException();
    }

    return kind;
  }

  public static fromPrefix(prefix: string): KnowledgeKind {
    const kind = KnowledgeKind.#all.find(
      candidate => candidate.prefix === prefix,
    );
    if (!kind) {
      throw new UnknownKnowledgeKindException();
    }

    return kind;
  }

  public get value(): string {
    return this.#value;
  }

  public get prefix(): string {
    return this.#prefix;
  }

  public equals(other: KnowledgeKind): boolean {
    return other.value === this.#value;
  }
}
