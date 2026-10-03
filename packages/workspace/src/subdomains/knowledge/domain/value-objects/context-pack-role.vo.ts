/**
 * Why a Knowledge Item is in a Context Pack. An item that comes in for
 * several reasons takes the one listed first.
 */
export class ContextPackRole {
  /** The subject of the task. */
  public static readonly Anchor = new ContextPackRole('anchor', true);
  /** Part of a Feature that is an Anchor: a subject of the task too. */
  public static readonly Part = new ContextPackRole('part', true);
  /** It contradicts an item of the pack. */
  public static readonly Conflict = new ContextPackRole('conflict', true);
  /** An Open Question about an item of the pack, not answered yet. */
  public static readonly Unsettled = new ContextPackRole('unsettled', true);
  /** A Business Rule on an Anchor or on what they rest on: the code must keep it. */
  public static readonly Rule = new ContextPackRole('rule', true);
  /** What the Anchors rest on, at any depth, the Feature an Anchor is part of included. */
  public static readonly Foundation = new ContextPackRole('foundation', false);
  /** It links to an Anchor, so changing the Anchor may break it. */
  public static readonly MayBeAffected = new ContextPackRole(
    'may-be-affected',
    false,
  );
  /** A Term an item of the pack uses. */
  public static readonly Term = new ContextPackRole('term', false);

  static readonly #all: readonly ContextPackRole[] = [
    ContextPackRole.Anchor,
    ContextPackRole.Part,
    ContextPackRole.Conflict,
    ContextPackRole.Unsettled,
    ContextPackRole.Rule,
    ContextPackRole.Foundation,
    ContextPackRole.MayBeAffected,
    ContextPackRole.Term,
  ];

  readonly #value: string;
  readonly #alwaysInFull: boolean;

  private constructor(value: string, alwaysInFull: boolean) {
    this.#value = value;
    this.#alwaysInFull = alwaysInFull;
  }

  public static get all(): readonly ContextPackRole[] {
    return ContextPackRole.#all;
  }

  public get value(): string {
    return this.#value;
  }

  /** Shown in full whatever the pack's budget: what an agent must not miss. */
  public get alwaysInFull(): boolean {
    return this.#alwaysInFull;
  }

  /** Lower comes first, and wins when an item comes in for several reasons. */
  public get rank(): number {
    return ContextPackRole.#all.indexOf(this);
  }
}
