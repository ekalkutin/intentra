import { InvalidLinkException } from '../exceptions/index.js';

import { KnowledgeKind } from './knowledge-kind.vo.js';

/** How one Knowledge Item relates to another it links to. */
export class KnowledgeLinkType {
  /** It holds only while the target holds. */
  public static readonly DependsOn = new KnowledgeLinkType('depends-on', null);
  public static readonly UsesTerm = new KnowledgeLinkType(
    'uses-term',
    KnowledgeKind.Term,
  );
  /** A Decision is the reason for it. */
  public static readonly JustifiedBy = new KnowledgeLinkType(
    'justified-by',
    KnowledgeKind.Decision,
  );
  /** It settles an Open Question. */
  public static readonly Answers = new KnowledgeLinkType(
    'answers',
    KnowledgeKind.OpenQuestion,
  );
  public static readonly ConflictsWith = new KnowledgeLinkType(
    'conflicts-with',
    null,
  );

  static readonly #all: readonly KnowledgeLinkType[] = [
    KnowledgeLinkType.DependsOn,
    KnowledgeLinkType.UsesTerm,
    KnowledgeLinkType.JustifiedBy,
    KnowledgeLinkType.Answers,
    KnowledgeLinkType.ConflictsWith,
  ];

  /** What a change of the target puts in question: the item rests on it. */
  public static readonly MarkingForReview: readonly KnowledgeLinkType[] = [
    KnowledgeLinkType.DependsOn,
    KnowledgeLinkType.JustifiedBy,
  ];

  readonly #value: string;
  readonly #targetKind: KnowledgeKind | null;

  private constructor(value: string, targetKind: KnowledgeKind | null) {
    this.#value = value;
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
