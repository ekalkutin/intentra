import { UnavailableException } from '@intentra/shared-kernel';

export class ModelUnavailableException extends UnavailableException<'MODEL_UNAVAILABLE'> {
  protected static override readonly defaultRetryable: boolean = true;

  constructor() {
    super(
      "The model's provider did not answer, even when asked again. Try again later",
      'MODEL_UNAVAILABLE',
    );
  }
}
