import { UnknownKnowledgeKindException } from '../exceptions/index.js';

/** What sort of knowledge a Knowledge Item holds; decides its fields and its Knowledge Key's prefix. */
export class KnowledgeKind {
  public static readonly ProductOverview = new KnowledgeKind(
    'product-overview',
    'PO',
  );
  public static readonly Goal = new KnowledgeKind('goal', 'GOAL');
  public static readonly Persona = new KnowledgeKind('persona', 'PER');
  public static readonly Scenario = new KnowledgeKind('scenario', 'SC');
  public static readonly Requirement = new KnowledgeKind('requirement', 'REQ');
  public static readonly Constraint = new KnowledgeKind('constraint', 'CON');
  public static readonly Term = new KnowledgeKind('term', 'TERM');
  public static readonly BusinessRule = new KnowledgeKind(
    'business-rule',
    'BR',
  );
  public static readonly Integration = new KnowledgeKind('integration', 'INT');
  public static readonly Decision = new KnowledgeKind('decision', 'DEC');
  public static readonly OpenQuestion = new KnowledgeKind(
    'open-question',
    'TBD',
  );

  static readonly #all: readonly KnowledgeKind[] = [
    KnowledgeKind.ProductOverview,
    KnowledgeKind.Goal,
    KnowledgeKind.Persona,
    KnowledgeKind.Scenario,
    KnowledgeKind.Requirement,
    KnowledgeKind.Constraint,
    KnowledgeKind.Term,
    KnowledgeKind.BusinessRule,
    KnowledgeKind.Integration,
    KnowledgeKind.Decision,
    KnowledgeKind.OpenQuestion,
  ];

  readonly #value: string;
  readonly #prefix: string;

  private constructor(value: string, prefix: string) {
    this.#value = value;
    this.#prefix = prefix;
  }

  public static get all(): readonly KnowledgeKind[] {
    return KnowledgeKind.#all;
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
