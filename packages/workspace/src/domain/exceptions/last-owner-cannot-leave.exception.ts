import { ConflictException } from '@intentra/shared-kernel';

export class LastOwnerCannotLeaveException extends ConflictException<'LAST_OWNER_CANNOT_LEAVE'> {
  constructor() {
    super(
      'The last owner can neither leave nor be removed: make another member an owner first',
      'LAST_OWNER_CANNOT_LEAVE',
    );
  }
}
