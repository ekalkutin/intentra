import { DomainException } from '@intentra/shared-kernel';

export class InvalidPersonalAccessTokenLifetimeException extends DomainException<'INVALID_PERSONAL_ACCESS_TOKEN_LIFETIME'> {
  constructor() {
    super(
      'Personal access token lifetime must be 30, 90 or 365 days, or never expire',
      'INVALID_PERSONAL_ACCESS_TOKEN_LIFETIME',
    );
  }
}
