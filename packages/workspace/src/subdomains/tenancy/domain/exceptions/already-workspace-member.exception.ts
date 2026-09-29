import { ConflictException } from '@intentra/shared-kernel';

export class AlreadyWorkspaceMemberException extends ConflictException<'ALREADY_WORKSPACE_MEMBER'> {
  constructor() {
    super(
      'This email already belongs to a member of the workspace',
      'ALREADY_WORKSPACE_MEMBER',
    );
  }
}
