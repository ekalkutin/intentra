/** How an object of the Unpublished Agents differs from the Published Agents. */
export class AgentsChangeKind {
  public static readonly Added = new AgentsChangeKind('added');
  public static readonly Changed = new AgentsChangeKind('changed');
  public static readonly Removed = new AgentsChangeKind('removed');

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
