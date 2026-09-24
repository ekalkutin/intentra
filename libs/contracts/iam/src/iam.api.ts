import type { AccountsApi } from './account/index.js';
import type { AuthApi } from './auth/index.js';

/**
 * Published API of IAM. The class itself is the DI token; the sub-APIs are
 * plain interfaces, so there is one way to inject IAM.
 * Monolith: bound to IAM's local service. Micro-services: to an HTTP client.
 */
export abstract class IamApi {
  abstract readonly accounts: AccountsApi;
  abstract readonly auth: AuthApi;
}
