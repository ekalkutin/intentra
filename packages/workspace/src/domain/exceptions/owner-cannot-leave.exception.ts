import { ConflictException } from '@intentra/shared-kernel';

export class OwnerCannotLeaveException extends ConflictException<'OWNER_CANNOT_LEAVE'> {
  constructor() {
    super(
      'The owner can neither leave nor be removed: transfer ownership first',
      'OWNER_CANNOT_LEAVE',
    );
  }
}
