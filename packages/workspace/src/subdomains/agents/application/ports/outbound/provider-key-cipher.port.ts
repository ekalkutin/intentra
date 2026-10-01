import type {
  EncryptedProviderKey,
  ProviderKeySecret,
} from '../../../domain/value-objects/index.js';

/** Encrypts Provider Keys with the server's secret, so the database alone never reveals them. */
export abstract class ProviderKeyCipher {
  abstract encrypt(secret: ProviderKeySecret): EncryptedProviderKey;
  abstract decrypt(encrypted: EncryptedProviderKey): ProviderKeySecret;
}
