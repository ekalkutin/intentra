import type { SignUpDto } from './sign-up.dto.js';
import { TokensDto } from './tokens.dto.js';

/**
 * Public port of IAM for accounts. The class itself is the DI token.
 * Monolith: bound to IAM's local adapter. Micro-services: to an HTTP client.
 */
export abstract class AuthApi {
  abstract signUp(data: SignUpDto): Promise<TokensDto>;
}
