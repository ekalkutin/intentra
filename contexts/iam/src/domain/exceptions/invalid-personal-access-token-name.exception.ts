import { DomainException } from '@intentra/shared';

export class InvalidPersonalAccessTokenNameException extends DomainException<'INVALID_PERSONAL_ACCESS_TOKEN_NAME'> {
  constructor(maxLength: number) {
    super(
      `Token name must be 1 to ${maxLength} characters long`,
      'INVALID_PERSONAL_ACCESS_TOKEN_NAME',
    );
  }
}
