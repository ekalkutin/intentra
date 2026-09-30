import { ForbiddenException } from '@intentra/shared-kernel';

export class DraftApprovalForbiddenException extends ForbiddenException<'DRAFT_APPROVAL_FORBIDDEN'> {
  constructor() {
    super(
      'Only a maintainer of the project can approve a draft',
      'DRAFT_APPROVAL_FORBIDDEN',
    );
  }
}
