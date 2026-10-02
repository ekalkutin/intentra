import {
  AnalysisRunStatusDtoSchema,
  type AnalysisRunDto,
} from '@intentra/contracts/workspace';

/** How often a page asks again while a run is running, in milliseconds. */
export const RUNNING_POLL_MS = 3000;

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
