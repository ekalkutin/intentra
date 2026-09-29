import { ForbiddenException } from '@intentra/shared-kernel';

export class ProjectDeletionForbiddenException extends ForbiddenException<'PROJECT_DELETION_FORBIDDEN'> {
  constructor() {
    super(
      'Only an owner of the workspace, or the manager who created the project, can delete it',
      'PROJECT_DELETION_FORBIDDEN',
    );
  }
}
