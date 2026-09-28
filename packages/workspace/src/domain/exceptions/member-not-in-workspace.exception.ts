import { DomainException } from '@intentra/shared-kernel';

export class MemberNotInWorkspaceException extends DomainException<'MEMBER_NOT_IN_WORKSPACE'> {
  constructor() {
    super(
      'Member does not belong to this workspace',
      'MEMBER_NOT_IN_WORKSPACE',
    );
  }
}
