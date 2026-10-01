import type { ProviderKeySecret } from '../../../domain/value-objects/index.js';

/** Asks the provider whether it accepts a key, before the key is kept. */
export abstract class ProviderKeyVerifier {
  /**
   * False when the provider rejects the key; throws
   * `ProviderUnavailableException` when it cannot tell.
   */
  abstract isAccepted(secret: ProviderKeySecret): Promise<boolean>;
}
