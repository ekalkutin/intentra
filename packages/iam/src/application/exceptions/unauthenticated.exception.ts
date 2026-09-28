import { UnauthorizedException } from '@intentra/shared-kernel';

export class UnauthenticatedException extends UnauthorizedException<'UNAUTHENTICATED'> {
  constructor() {
    super('Access token is invalid or expired', 'UNAUTHENTICATED');
  }
}
