import { ConflictException } from '@intentra/shared';

export class EmailAlreadyTakenException extends ConflictException<'EMAIL_ALREADY_TAKEN'> {
  constructor() {
    super('Email is already taken', 'EMAIL_ALREADY_TAKEN');
  }
}
