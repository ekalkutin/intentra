import { ForbiddenException } from '@intentra/shared-kernel';

export class NotWorkspaceOwnerException extends ForbiddenException<'NOT_WORKSPACE_OWNER'> {
  constructor() {
    super('Only the owner of the workspace can do this', 'NOT_WORKSPACE_OWNER');
  }
}
