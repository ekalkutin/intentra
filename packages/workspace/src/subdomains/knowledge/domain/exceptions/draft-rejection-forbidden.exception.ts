import { ForbiddenException } from '@intentra/shared-kernel';

export class DraftRejectionForbiddenException extends ForbiddenException<'DRAFT_REJECTION_FORBIDDEN'> {
  constructor() {
    super(
      'Only a maintainer of the project can reject a draft',
      'DRAFT_REJECTION_FORBIDDEN',
    );
  }
}
