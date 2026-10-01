import { DomainException } from '@intentra/shared-kernel';

export class InvalidProviderKeyException extends DomainException<'INVALID_PROVIDER_KEY'> {
  constructor() {
    super(
      'Provider key must be 9 to 256 characters long, with no spaces',
      'INVALID_PROVIDER_KEY',
    );
  }
}
