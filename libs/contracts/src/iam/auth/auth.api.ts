import type { Actor } from './actor.js';
import type { RefreshTokensDto } from './refresh-tokens.dto.js';
import type {
  RegisterAccountDto,
  SignUpContext,
} from './register-account.dto.js';
import type { SignInDto } from './sign-in.dto.js';
import type { TokenPair } from './token-pair.js';

export abstract class AuthApi {
  /** While Open Sign-up is off, only an invited email may sign up (403 `SIGN_UP_CLOSED`). */
  abstract register(
    data: RegisterAccountDto,
    context: SignUpContext,
  ): Promise<void>;
  abstract signIn(data: SignInDto): Promise<TokenPair>;
  abstract refresh(data: RefreshTokensDto): Promise<TokenPair>;
  abstract authenticate(accessToken: string): Promise<Actor>;
}
