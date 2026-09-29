import { ConflictException } from '@intentra/shared-kernel';

export class OwnerProjectRoleFixedException extends ConflictException<'OWNER_PROJECT_ROLE_FIXED'> {
  constructor() {
    super(
      'An owner of the workspace is a maintainer in every project, and that cannot be changed',
      'OWNER_PROJECT_ROLE_FIXED',
    );
  }
}
