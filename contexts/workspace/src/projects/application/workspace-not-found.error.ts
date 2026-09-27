import { WorkspaceId } from '@intentra/shared';

export class WorkspaceNotFoundError extends Error {
  constructor(public readonly workspaceId: WorkspaceId) {
    super(`Workspace ${workspaceId.value} not found`);
    this.name = WorkspaceNotFoundError.name;
  }
}
