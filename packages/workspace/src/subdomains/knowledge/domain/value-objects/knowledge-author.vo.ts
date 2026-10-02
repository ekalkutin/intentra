import { MemberId } from '../../../tenancy/index.js';

/** Who recorded a Knowledge Item: a Member, or Intentra itself in an Analysis Run. */
export class KnowledgeAuthor {
  public static readonly Intentra = new KnowledgeAuthor(null);

  readonly #memberId: MemberId | null;

  private constructor(memberId: MemberId | null) {
    this.#memberId = memberId;
  }

  public static member(memberId: MemberId): KnowledgeAuthor {
    return new KnowledgeAuthor(memberId);
  }

  /** From a Member's id, or null for Intentra. */
  public static from(memberId: string | null): KnowledgeAuthor {
    return memberId === null
      ? KnowledgeAuthor.Intentra
      : new KnowledgeAuthor(new MemberId(memberId));
  }

  /** The Member who recorded it; null when Intentra did. */
  public get memberId(): MemberId | null {
    return this.#memberId;
  }

  public isIntentra(): boolean {
    return this.#memberId === null;
  }
}
