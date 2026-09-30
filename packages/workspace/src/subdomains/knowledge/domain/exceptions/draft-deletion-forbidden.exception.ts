import { ForbiddenException } from '@intentra/shared-kernel';

export class DraftDeletionForbiddenException extends ForbiddenException<'DRAFT_DELETION_FORBIDDEN'> {
  constructor() {
    super(
      'Only a contributor or maintainer of the project can delete a draft',
      'DRAFT_DELETION_FORBIDDEN',
    );
  }
}
