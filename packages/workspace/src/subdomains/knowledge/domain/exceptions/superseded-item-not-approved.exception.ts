import { ConflictException } from '@intentra/shared-kernel';

export class SupersededItemNotApprovedException extends ConflictException<'SUPERSEDED_ITEM_NOT_APPROVED'> {
  constructor() {
    super(
      'The item this draft replaces is no longer approved: it was replaced or retired, so compare with the current one and record a replacement for it',
      'SUPERSEDED_ITEM_NOT_APPROVED',
    );
  }
}
