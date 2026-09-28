import { UnauthorizedException } from '@intentra/shared-kernel';

export class InvalidCredentialsException extends UnauthorizedException<'INVALID_CREDENTIALS'> {
  constructor() {
    super('Email or password is incorrect', 'INVALID_CREDENTIALS');
  }
}
