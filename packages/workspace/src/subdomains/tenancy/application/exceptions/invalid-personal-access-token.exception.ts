import { UnauthorizedException } from '@intentra/shared-kernel';

/** Unknown, expired and revoked tokens, and tokens of Members who left, all read the same. */
export class InvalidPersonalAccessTokenException extends UnauthorizedException<'INVALID_PERSONAL_ACCESS_TOKEN'> {
  constructor() {
    super(
      'Personal access token is invalid or expired',
      'INVALID_PERSONAL_ACCESS_TOKEN',
    );
  }
}
