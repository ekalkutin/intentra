/**
 * The id of a tool an agent may be allowed to use, in `snake_case`. Which tools
 * exist is not the domain's knowledge: the application checks new ids against
 * the tool catalog, so a profile whose tool was later removed still loads.
 */
export class ToolId {
  static readonly #FORMAT = /^[a-z]+(_[a-z]+)*$/;

  constructor(public readonly value: string) {
    if (!ToolId.#FORMAT.test(value)) {
      throw new Error(`Tool id must be snake_case: ${value}`);
    }
  }

  public equals(other: ToolId): boolean {
    return other.value === this.value;
  }
}
