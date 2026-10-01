/** A Workspace as a Platform Admin sees it: only from outside, never what is inside. */
export type PlatformWorkspaceDto = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly suspended: boolean;
  /** The Owners' emails. */
  readonly owners: readonly string[];
  /** Active Members, Owners included. */
  readonly membersCount: number;
  readonly projectsCount: number;
  readonly hasProviderKey: boolean;
};
