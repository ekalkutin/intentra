import { ConflictException } from '@intentra/shared-kernel';

export class LastOwnerCannotStepDownException extends ConflictException<'LAST_OWNER_CANNOT_STEP_DOWN'> {
  constructor() {
    super(
      'The last owner cannot give up the owner role: make another member an owner first',
      'LAST_OWNER_CANNOT_STEP_DOWN',
    );
  }
}
