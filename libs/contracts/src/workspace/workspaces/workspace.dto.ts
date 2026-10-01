export type WorkspaceDto = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  /** Suspended by a Platform Admin: everything can be read, nothing changed, no AI works. */
  readonly suspended: boolean;
};
