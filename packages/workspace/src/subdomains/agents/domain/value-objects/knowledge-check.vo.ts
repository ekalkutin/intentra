/**
 * When an Analysis Run last looked at a Knowledge Item, and at which version
 * of it. A Knowledge Item's version grows with every change, so an item is
 * Unchecked unless a check holds its current version.
 */
export class KnowledgeCheck {
  readonly #key: string;
  readonly #version: number;
  readonly #checkedAt: Temporal.Instant;

  constructor(props: {
    readonly key: string;
    readonly version: number;
    readonly checkedAt: Temporal.Instant;
  }) {
    this.#key = props.key;
    this.#version = props.version;
    this.#checkedAt = props.checkedAt;
  }

  /** The Knowledge Key of the item looked at. */
  get key(): string {
    return this.#key;
  }

  get version(): number {
    return this.#version;
  }

  get checkedAt(): Temporal.Instant {
    return this.#checkedAt;
  }

  /** Whether it still covers the item: the same item, unchanged since. */
  public covers(item: {
    readonly key: string;
    readonly version: number;
  }): boolean {
    return this.#key === item.key && this.#version >= item.version;
  }
}
