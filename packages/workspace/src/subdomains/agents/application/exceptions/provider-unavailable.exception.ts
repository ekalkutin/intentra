import { UnavailableException } from '@intentra/shared-kernel';

export class ProviderUnavailableException extends UnavailableException<'PROVIDER_UNAVAILABLE'> {
  protected static override readonly defaultRetryable: boolean = true;

  constructor() {
    super(
      'OpenRouter could not check the key. Try again later',
      'PROVIDER_UNAVAILABLE',
    );
  }
}
