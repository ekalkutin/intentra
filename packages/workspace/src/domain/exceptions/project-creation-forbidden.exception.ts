import { ForbiddenException } from '@intentra/shared-kernel';

export class ProjectCreationForbiddenException extends ForbiddenException<'PROJECT_CREATION_FORBIDDEN'> {
  constructor() {
    super(
      'Only an owner or a manager of the workspace can create a project',
      'PROJECT_CREATION_FORBIDDEN',
    );
  }
}
