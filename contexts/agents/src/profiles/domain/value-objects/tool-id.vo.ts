/**
 * A tool an agent may be allowed to use. The id is stored with the profile, so
 * it is data, not a magic string: every known id is declared here once, and
 * code refers to the instances (`ToolId.SearchProjectKnowledge`), never to the
 * raw value.
 */
export class ToolId {
  public static readonly SearchProjectKnowledge = new ToolId(
    'search_project_knowledge',
  );
  public static readonly GetTraceability = new ToolId('get_traceability');

  static readonly #known: readonly ToolId[] = [
    ToolId.SearchProjectKnowledge,
    ToolId.GetTraceability,
  ];

  private constructor(public readonly value: string) {}

  /** Restores a stored id; an id that is not in the catalogue is rejected. */
  public static from(value: string): ToolId {
    const tool = ToolId.#known.find(known => known.value === value);
    if (!tool) {
      throw new Error(`Unknown tool: ${value}`);
    }
    return tool;
  }

  public equals(other: ToolId): boolean {
    return other.value === this.value;
  }
}
