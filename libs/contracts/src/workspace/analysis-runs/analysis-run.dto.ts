import { z } from 'zod';

/** Where an Analysis Run stands. */
export const AnalysisRunStatusDtoSchema = z.enum([
  'running',
  'completed',
  'failed',
]);

export type AnalysisRunStatusDto = z.infer<typeof AnalysisRunStatusDtoSchema>;

/**
 * What it looks at: `whole-project`, a run started by hand; `changes`, a run
 * the schedule started, over what was approved or retired since the last
 * completed run.
 */
export const AnalysisRunScopeDtoSchema = z.enum(['whole-project', 'changes']);

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
  /** For `changes`, the Knowledge Keys of what was approved or retired; empty for the whole Project. */
  readonly changedKeys: string[];
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

/**
 * Why a nightly run cannot go ahead tonight, though turned on:
 * `provider-key-missing`, the Workspace has no Provider Key;
 * `agents-not-published`, no Agents are published yet.
 */
export const AnalysisScheduleBlockDtoSchema = z.enum([
  'provider-key-missing',
  'agents-not-published',
]);

export type AnalysisScheduleBlockDto = z.infer<
  typeof AnalysisScheduleBlockDtoSchema
>;

/** Whether the Project is checked every night, over what changed since the last completed run. */
export type AnalysisScheduleDto = {
  readonly enabled: boolean;
  /** The Member who last turned it on or off; null if no one ever did. */
  readonly changedBy: string | null;
  /** ISO 8601, or null if no one ever did. */
  readonly changedAt: string | null;
  /** What keeps a nightly run from going ahead now; null when nothing does. */
  readonly blockedBy: AnalysisScheduleBlockDto | null;
  readonly access: {
    /** Whether the caller may turn it on or off: a Maintainer. */
    readonly canChange: boolean;
  };
};

export const ChangeAnalysisScheduleDtoSchema = z.object({
  enabled: z.boolean(),
});

export type ChangeAnalysisScheduleDto = z.infer<
  typeof ChangeAnalysisScheduleDtoSchema
>;
