import { NotFoundException } from '@intentra/shared-kernel';

export class WorkspaceNotFoundException extends NotFoundException<'WORKSPACE_NOT_FOUND'> {
  constructor() {
    super('Workspace not found', 'WORKSPACE_NOT_FOUND');
  }
}
