import {
  AnalysisRunStatusDtoSchema,
  type AnalysisRunDto,
  type AnalysisRunPageDto,
} from '@intentra/contracts/workspace';

/** How often a page asks again while a run is running, in milliseconds. */
export const RUNNING_POLL_MS = 3000;

/** How much of a Project's Drafts and Approved items, Open Questions aside, are checked. */
export type AnalysisCoverage = AnalysisRunPageDto['coverage'];

export function isRunning(run: AnalysisRunDto): boolean {
  return run.status === AnalysisRunStatusDtoSchema.enum.running;
}

/** The newest run that finished with questions found, if the newest finished one did. */
export function latestFindings(
  runs: readonly AnalysisRunDto[],
): AnalysisRunDto | null {
  const finished = runs.find(run => !isRunning(run));

  return finished && finished.questionKeys.length > 0 ? finished : null;
}

/**
 * Whether the run counts its items: every run since runs went item by item
 * that got as far as knowing them. One from before, or one that failed before
 * it started reading, has none to count.
 */
export function countsItems(run: AnalysisRunDto): boolean {
  return run.itemCount > 0;
}

/** How many of its items a failed run did not reach: they stay Unchecked. 0 for any other run. */
export function leftUnchecked(run: AnalysisRunDto): number {
  return run.status === AnalysisRunStatusDtoSchema.enum.failed
    ? Math.max(run.itemCount - run.checkedCount, 0)
    : 0;
}

/** How many of the Project's items no run has looked at since they last changed. */
export function uncheckedCount(coverage: AnalysisCoverage): number {
  return Math.max(coverage.total - coverage.checked, 0);
}
