import { DomainException } from '@intentra/shared-kernel';

export class InvalidPersonalAccessTokenNameException extends DomainException<'INVALID_PERSONAL_ACCESS_TOKEN_NAME'> {
  constructor() {
    super(
      'Personal access token name must be 1 to 100 characters long',
      'INVALID_PERSONAL_ACCESS_TOKEN_NAME',
    );
  }
}
