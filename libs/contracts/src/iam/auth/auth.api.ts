import type { Actor } from './actor.js';
import type { RefreshTokensDto } from './refresh-tokens.dto.js';
import type { RegisterAccountDto } from './register-account.dto.js';
import type { SignInDto } from './sign-in.dto.js';
import type { TokenPair } from './token-pair.js';

export interface AuthApi {
  register(data: RegisterAccountDto): Promise<void>;
  signIn(data: SignInDto): Promise<TokenPair>;
  refresh(data: RefreshTokensDto): Promise<TokenPair>;
  authenticate(accessToken: string): Promise<Actor>;
}
