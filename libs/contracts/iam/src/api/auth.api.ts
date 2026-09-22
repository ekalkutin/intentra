import {
  AccessTokenPayload,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  TokensDto,
  VerifyAccessTokenDto,
} from '../dto/auth.js';

export interface AuthApi {
  signUp(dto: SignUpDto): Promise<TokensDto>;
  signIn(dto: SignInDto): Promise<TokensDto>;
  refreshToken(dto: RefreshTokenDto): Promise<TokensDto>;

  verifyAccessToken(
    dto: VerifyAccessTokenDto,
  ): Promise<AccessTokenPayload | null>;
}
