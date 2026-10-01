import { ForbiddenException } from '@intentra/shared-kernel';

export class WorkspaceCreationClosedException extends ForbiddenException<'WORKSPACE_CREATION_CLOSED'> {
  constructor() {
    super(
      'Only a Platform Admin can create a workspace: ask a workspace owner to invite you',
      'WORKSPACE_CREATION_CLOSED',
    );
  }
}
