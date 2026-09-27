import { NotFoundException } from '@intentra/shared';

/** Also thrown for a workspace the account is not a member of: no hints. */
export class WorkspaceNotFoundException extends NotFoundException<'WORKSPACE_NOT_FOUND'> {
  constructor(workspaceId: string) {
    super(`Workspace ${workspaceId} not found`, 'WORKSPACE_NOT_FOUND');
  }
}
