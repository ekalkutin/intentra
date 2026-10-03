import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import type { Project } from '../../../../tenancy/index.js';
import type { AgentsContent } from '../../../domain/entities/index.js';
import type { ProviderKeySecret } from '../../../domain/value-objects/index.js';

/** What one model call of an Analysis Run judges: one item, the knowledge around it, and what was already asked. */
export type AuditGroup = {
  /** The item under check. */
  readonly item: KnowledgeItemDto;
  /** Its Similar Items and the items it is linked to, either way. */
  readonly around: readonly KnowledgeItemDto[];
  /** The Open Questions about any of them, Rejected ones included. */
  readonly questions: readonly KnowledgeItemDto[];
};

export type AuditJudgement = {
  readonly project: Project;
  /** The Agents that hold the Auditor to run. */
  readonly agents: AgentsContent;
  /** The Workspace's key; the call runs on it. */
  readonly providerKey: ProviderKeySecret;
  readonly group: AuditGroup;
};

/** One thing the Auditor found, to be recorded as an Open Question. */
export type AuditFinding = {
  readonly title: string;
  readonly question: string;
  readonly rationale: string;
  /** The Knowledge Keys it is about. */
  readonly concerns: readonly string[];
};

/**
 * The Auditor, run by the Agents' runtime as given: one model call per group
 * (Agents ADR 0005). Rejects with `ModelUnavailableException` when the
 * model's provider does not answer even when asked again, and with any other
 * error when the Auditor or its model fails otherwise.
 */
export abstract class Auditor {
  abstract judge(judgement: AuditJudgement): Promise<AuditFinding[]>;
}
