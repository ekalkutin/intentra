import type { Project } from '../../../../tenancy/index.js';
import type { AgentsContent } from '../../../domain/entities/index.js';
import type {
  AnalysisRunScope,
  ProviderKeySecret,
} from '../../../domain/value-objects/index.js';

export type AuditTask = {
  readonly project: Project;
  readonly scope: AnalysisRunScope;
  /** For a run over the changes, what changed, by Knowledge Key. */
  readonly changes: {
    readonly approved: readonly string[];
    readonly retired: readonly string[];
  } | null;
  /** The Agents that hold the Auditor to run. */
  readonly agents: AgentsContent;
  /** The Workspace's key; every model call of the run runs on it. */
  readonly providerKey: ProviderKeySecret;
};

export type AuditResult = {
  /** False when the Auditor or its model failed; the cause is logged. */
  readonly succeeded: boolean;
  /** The Open Questions it recorded, by Knowledge Key, even when it failed later. */
  readonly questionKeys: readonly string[];
  /** It stopped at the most steps a run may take. */
  readonly stepLimitReached: boolean;
};

/** The Auditor, run by the Agents' runtime as given. Never rejects. */
export abstract class Auditor {
  abstract audit(task: AuditTask): Promise<AuditResult>;
}
