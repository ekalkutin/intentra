/** The Analysis API's error codes the pages treat on their own, beyond showing their text. */
export const ANALYSIS_ERROR_CODES = {
  /** Only a Maintainer turns the nightly check on or off. */
  scheduleForbidden: 'ANALYSIS_SCHEDULE_FORBIDDEN',
  /** Nothing changes in a suspended Workspace. */
  workspaceSuspended: 'WORKSPACE_SUSPENDED',
} as const;
