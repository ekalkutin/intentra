import { ApplicationException } from '@intentra/shared-kernel';

export class ProviderKeyRejectedException extends ApplicationException<'PROVIDER_KEY_REJECTED'> {
  constructor() {
    super(
      'OpenRouter does not accept this key: it is wrong, disabled or expired',
      'PROVIDER_KEY_REJECTED',
    );
  }
}
