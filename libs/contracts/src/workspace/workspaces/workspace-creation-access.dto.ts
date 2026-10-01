/** Whether the calling person may create a Workspace right now (docs/adr/0002-client-shows-the-policy-verdict.md). */
export type WorkspaceCreationAccessDto = {
  readonly canCreate: boolean;
};
