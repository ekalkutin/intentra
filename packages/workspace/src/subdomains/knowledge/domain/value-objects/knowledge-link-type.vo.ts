import { InvalidLinkException } from '../exceptions/index.js';

import { KnowledgeKind } from './knowledge-kind.vo.js';

/** How one Knowledge Item relates to another it links to. */
export class KnowledgeLinkType {
  /** It holds only while the target holds. */
  public static readonly DependsOn = new KnowledgeLinkType(
    'depends-on',
    null,
    null,
  );
  public static readonly UsesTerm = new KnowledgeLinkType(
    'uses-term',
    null,
    KnowledgeKind.Term,
  );
  /** A Decision is the reason for it. */
  public static readonly JustifiedBy = new KnowledgeLinkType(
    'justified-by',
    null,
    KnowledgeKind.Decision,
  );
  /** A Scenario, Requirement or Business Rule belongs to a Feature. */
  public static readonly PartOf = new KnowledgeLinkType(
    'part-of',
    [
      KnowledgeKind.Scenario,
      KnowledgeKind.Requirement,
      KnowledgeKind.BusinessRule,
    ],
    KnowledgeKind.Feature,
  );
  /** It settles an Open Question. */
  public static readonly Answers = new KnowledgeLinkType(
    'answers',
    null,
    KnowledgeKind.OpenQuestion,
  );
  /** An Open Question is about the target. */
  public static readonly Concerns = new KnowledgeLinkType(
    'concerns',
    [KnowledgeKind.OpenQuestion],
    null,
  );
  public static readonly ConflictsWith = new KnowledgeLinkType(
    'conflicts-with',
    null,
    null,
  );

  static readonly #all: readonly KnowledgeLinkType[] = [
    KnowledgeLinkType.DependsOn,
    KnowledgeLinkType.UsesTerm,
    KnowledgeLinkType.JustifiedBy,
    KnowledgeLinkType.PartOf,
    KnowledgeLinkType.Answers,
    KnowledgeLinkType.Concerns,
    KnowledgeLinkType.ConflictsWith,
  ];

  /**
   * What a change of the target puts in question: the item rests on it. A
   * Feature's parts are put in question when it is retired or rejected, not
   * when it is replaced: they move onto the replacement.
   */
  public static readonly MarkingForReview: readonly KnowledgeLinkType[] = [
    KnowledgeLinkType.DependsOn,
    KnowledgeLinkType.JustifiedBy,
    KnowledgeLinkType.PartOf,
  ];

  readonly #value: string;
  readonly #sourceKinds: readonly KnowledgeKind[] | null;
  readonly #targetKind: KnowledgeKind | null;

  private constructor(
    value: string,
    sourceKinds: readonly KnowledgeKind[] | null,
    targetKind: KnowledgeKind | null,
  ) {
    this.#value = value;
    this.#sourceKinds = sourceKinds;
    this.#targetKind = targetKind;
  }

  public static from(value: string): KnowledgeLinkType {
    const type = KnowledgeLinkType.#all.find(
      candidate => candidate.value === value,
    );
    if (!type) {
      throw new InvalidLinkException();
    }

    return type;
  }

  public get value(): string {
    return this.#value;
  }

  public allowsSource(kind: KnowledgeKind): boolean {
    return (
      this.#sourceKinds === null ||
      this.#sourceKinds.some(sourceKind => sourceKind.equals(kind))
    );
  }

  public allowsTarget(kind: KnowledgeKind): boolean {
    return this.#targetKind === null || this.#targetKind.equals(kind);
  }

  public marksForReview(): boolean {
    return KnowledgeLinkType.MarkingForReview.includes(this);
  }

  public equals(other: KnowledgeLinkType): boolean {
    return other.value === this.#value;
  }
}
