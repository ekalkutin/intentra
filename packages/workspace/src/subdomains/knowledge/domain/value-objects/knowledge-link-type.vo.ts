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
  /** It settles an Open Question. */
  public static readonly Answers = new KnowledgeLinkType(
    'answers',
    null,
    KnowledgeKind.OpenQuestion,
  );
  /** An Open Question is about the target. */
  public static readonly Concerns = new KnowledgeLinkType(
    'concerns',
    KnowledgeKind.OpenQuestion,
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
    KnowledgeLinkType.Answers,
    KnowledgeLinkType.Concerns,
    KnowledgeLinkType.ConflictsWith,
  ];

  /** What a change of the target puts in question: the item rests on it. */
  public static readonly MarkingForReview: readonly KnowledgeLinkType[] = [
    KnowledgeLinkType.DependsOn,
    KnowledgeLinkType.JustifiedBy,
  ];

  readonly #value: string;
  readonly #sourceKind: KnowledgeKind | null;
  readonly #targetKind: KnowledgeKind | null;

  private constructor(
    value: string,
    sourceKind: KnowledgeKind | null,
    targetKind: KnowledgeKind | null,
  ) {
    this.#value = value;
    this.#sourceKind = sourceKind;
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
    return this.#sourceKind === null || this.#sourceKind.equals(kind);
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
