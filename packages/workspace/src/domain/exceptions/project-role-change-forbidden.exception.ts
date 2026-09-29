import { ForbiddenException } from '@intentra/shared-kernel';

export class ProjectRoleChangeForbiddenException extends ForbiddenException<'PROJECT_ROLE_CHANGE_FORBIDDEN'> {
  constructor() {
    super(
      'Only an owner of the workspace or a maintainer of the project can change project roles',
      'PROJECT_ROLE_CHANGE_FORBIDDEN',
    );
  }
}
