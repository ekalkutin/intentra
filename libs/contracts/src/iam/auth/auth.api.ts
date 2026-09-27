import type { SignUpDto } from './sign-up.dto.js';
import type { TokensDto } from './tokens.dto.js';

/** Authentication of IAM. Reached through `IamApi.auth`. */
export interface AuthApi {
  signUp(data: SignUpDto): Promise<TokensDto>;
}
