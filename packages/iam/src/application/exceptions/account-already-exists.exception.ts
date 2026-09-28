import { ConflictException } from '@intentra/shared-kernel';

export class AccountAlreadyExistsException extends ConflictException<'ACCOUNT_ALREADY_EXISTS'> {
  constructor() {
    super(
      'An account with this email already exists',
      'ACCOUNT_ALREADY_EXISTS',
    );
  }
}
