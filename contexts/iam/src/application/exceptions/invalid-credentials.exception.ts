import { UnauthorizedException } from '@intentra/shared';

/** One failure for a wrong email, a wrong password or a bad token: no hints. */
export class InvalidCredentialsException extends UnauthorizedException<'INVALID_CREDENTIALS'> {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS');
  }
}
