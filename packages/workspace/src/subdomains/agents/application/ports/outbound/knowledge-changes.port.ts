import type { Project } from '../../../../tenancy/index.js';

export type KnowledgeChanges = {
  /** Approved since then and still Approved, by Knowledge Key. */
  readonly approved: readonly string[];
  /** Retired since then, by Knowledge Key. */
  readonly retired: readonly string[];
};

/** What changed in a Project's Approved knowledge, read from Knowledge as Intentra itself. */
export abstract class KnowledgeChangesReader {
  abstract since(
    project: Project,
    moment: Temporal.Instant,
  ): Promise<KnowledgeChanges>;
}
