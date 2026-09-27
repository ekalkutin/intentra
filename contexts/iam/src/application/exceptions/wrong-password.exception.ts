import { ApplicationException } from '@intentra/shared';

/** The current password did not match. Not a 401: the session is still valid. */
export class WrongPasswordException extends ApplicationException<'WRONG_PASSWORD'> {
  constructor() {
    super('Current password is wrong', 'WRONG_PASSWORD');
  }
}
