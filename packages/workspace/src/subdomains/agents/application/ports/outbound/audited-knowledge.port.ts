import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import type { Project } from '../../../../tenancy/index.js';

/** An Open Question to record as Intentra itself, concerning items by Knowledge Key. */
export type AuditQuestion = {
  readonly title: string;
  readonly question: string;
  readonly rationale: string;
  readonly concerns: readonly string[];
};

/** A Project's knowledge as an Analysis Run reads and adds to it, through Knowledge's published API as Intentra itself. */
export abstract class AuditedKnowledge {
  /** Every Draft and Approved item, and the Rejected Open Questions, so that none is asked again. */
  abstract read(project: Project): Promise<KnowledgeItemDto[]>;
  /** The item's Similar Items by Knowledge Key, the closest first. */
  abstract similar(
    project: Project,
    key: string,
    take: number,
  ): Promise<string[]>;
  /** Records a Draft Open Question and gives it back. */
  abstract record(
    project: Project,
    question: AuditQuestion,
  ): Promise<KnowledgeItemDto>;
}
