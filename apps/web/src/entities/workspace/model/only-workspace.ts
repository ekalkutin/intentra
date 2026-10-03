import type { WorkspaceDto } from '@intentra/contracts/workspace';

/**
 * The Workspace to start with: the only one there is; with several nothing is
 * chosen for the person, so that a token does not land in the first by a
 * hasty click.
 */
export function onlyWorkspaceId(
  workspaces: readonly WorkspaceDto[] | undefined,
): string | null {
  return workspaces?.length === 1 ? (workspaces[0]?.id ?? null) : null;
}
