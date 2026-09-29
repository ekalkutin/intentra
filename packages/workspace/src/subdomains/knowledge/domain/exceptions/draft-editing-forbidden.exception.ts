import { ForbiddenException } from '@intentra/shared-kernel';

export class DraftEditingForbiddenException extends ForbiddenException<'DRAFT_EDITING_FORBIDDEN'> {
  constructor() {
    super(
      'Only a contributor or maintainer of the project can edit a draft',
      'DRAFT_EDITING_FORBIDDEN',
    );
  }
}
