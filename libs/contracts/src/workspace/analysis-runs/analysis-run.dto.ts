import { z } from 'zod';

/** Where an Analysis Run stands. */
export const AnalysisRunStatusDtoSchema = z.enum([
  'running',
  'completed',
  'failed',
]);

export type AnalysisRunStatusDto = z.infer<typeof AnalysisRunStatusDtoSchema>;

/** What it looks at: for now always the whole Project, the run started by hand. */
export const AnalysisRunScopeDtoSchema = z.enum(['whole-project']);

export type AnalysisRunScopeDto = z.infer<typeof AnalysisRunScopeDtoSchema>;

/**
 * Why it failed: `interrupted`, the API stopped while it ran;
 * `provider-key-missing`, the Workspace has no Provider Key;
 * `agents-not-published`, no Agents are published yet; `auditor-failed`,
 * the Auditor or its model failed (the cause stays in the logs).
 */
export const AnalysisRunFailureDtoSchema = z.enum([
  'interrupted',
  'provider-key-missing',
  'agents-not-published',
  'auditor-failed',
]);

export type AnalysisRunFailureDto = z.infer<typeof AnalysisRunFailureDtoSchema>;

/** One pass in which the Auditor looked over a Project's Approved knowledge. */
export type AnalysisRunDto = {
  readonly id: string;
  readonly scope: AnalysisRunScopeDto;
  readonly status: AnalysisRunStatusDto;
  /** The Member who started it; null for one the schedule started. */
  readonly startedBy: string | null;
  /** ISO 8601 */
  readonly startedAt: string;
  /** ISO 8601, or null while it runs. */
  readonly finishedAt: string | null;
  /** The Agents Version its Auditor came from; null when it failed before one was known. */
  readonly agentsVersion: number | null;
  /** The Open Questions it recorded, as Intentra, by Knowledge Key. */
  readonly questionKeys: string[];
  /** The Auditor stopped at the most steps a run may take, perhaps before it was through. */
  readonly stepLimitReached: boolean;
  /** Null unless it failed. */
  readonly failure: AnalysisRunFailureDto | null;
};

/** One page of a Project's Analysis Runs, the newest first. */
export type AnalysisRunPageDto = {
  readonly items: AnalysisRunDto[];
  /** How many there are, across every page. */
  readonly total: number;
  readonly access: {
    /** Whether the caller may start one: a Contributor or Maintainer. */
    readonly canStart: boolean;
  };
};

export const ListAnalysisRunsDtoSchema = z.object({
  take: z.coerce.number().int().min(1).max(200).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListAnalysisRunsDto = z.infer<typeof ListAnalysisRunsDtoSchema>;
