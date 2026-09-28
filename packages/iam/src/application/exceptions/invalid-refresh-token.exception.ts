import { UnauthorizedException } from '@intentra/shared-kernel';

export class InvalidRefreshTokenException extends UnauthorizedException<'INVALID_REFRESH_TOKEN'> {
  constructor() {
    super('Refresh token is invalid or expired', 'INVALID_REFRESH_TOKEN');
  }
}
