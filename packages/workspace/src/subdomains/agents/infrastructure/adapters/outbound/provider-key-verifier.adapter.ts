import { Injectable, Logger, Provider } from '@nestjs/common';

import { ProviderUnavailableException } from '../../../application/exceptions/index.js';
import { ProviderKeyVerifier } from '../../../application/ports/outbound/index.js';
import type { ProviderKeySecret } from '../../../domain/value-objects/index.js';

/** Describes the key it is called with; 401 for a wrong, disabled or expired one. */
const OPENROUTER_KEY_URL = 'https://openrouter.ai/api/v1/key';
const TIMEOUT_MS = 10_000;
const UNAUTHORIZED = 401;

/** Asks OpenRouter about the key itself; spends no credits. */
@Injectable()
export class ProviderKeyVerifierAdapter extends ProviderKeyVerifier {
  readonly #logger = new Logger(ProviderKeyVerifierAdapter.name);

  public async isAccepted(secret: ProviderKeySecret): Promise<boolean> {
    let response: Response;
    try {
      response = await fetch(OPENROUTER_KEY_URL, {
        headers: { Authorization: `Bearer ${secret.value}` },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      this.#logger.error(error);
      throw new ProviderUnavailableException();
    }
    if (response.status === UNAUTHORIZED) {
      return false;
    }
    if (!response.ok) {
      this.#logger.error(`OpenRouter answered ${response.status}`);
      throw new ProviderUnavailableException();
    }

    return true;
  }
}

export const PROVIDER_KEY_VERIFIER_PROVIDER: Provider = {
  provide: ProviderKeyVerifier,
  useClass: ProviderKeyVerifierAdapter,
};
