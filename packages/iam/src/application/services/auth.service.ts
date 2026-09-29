import { Injectable } from '@nestjs/common';

import type {
  Actor,
  AuthApi,
  RefreshTokensDto,
  RegisterAccountDto,
  SignInDto,
  TokenPair,
} from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared-kernel';

import { Account } from '../../domain/entities/index.js';
import { Email } from '../../domain/value-objects/index.js';
import {
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UnauthenticatedException,
} from '../exceptions/index.js';
import {
  AccountRepository,
  PasswordHasher,
  TokenSigner,
} from '../ports/outbound/index.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
  ) {}

  public async register(data: RegisterAccountDto): Promise<void> {
    const passwordHash = await this.passwordHasher.hash(data.password);
    const account = Account.register({ email: data.email, passwordHash });

    await this.accountRepository.save(account);
  }

  public async signIn(data: SignInDto): Promise<TokenPair> {
    const account = await this.accountRepository.findOne({
      email: new Email(data.email),
    });
    const passwordMatches =
      account !== null &&
      (await this.passwordHasher.compare(data.password, account.passwordHash));

    if (!account || !passwordMatches) {
      throw new InvalidCredentialsException();
    }

    return this.issueTokens(account);
  }

  public async refresh(data: RefreshTokensDto): Promise<TokenPair> {
    const claims = await this.tokenSigner.verifyRefreshToken(data.refreshToken);
    const account =
      claims &&
      (await this.accountRepository.findOne({
        id: new AccountId(claims.accountId),
      }));

    if (!account) {
      throw new InvalidRefreshTokenException();
    }

    return this.issueTokens(account);
  }

  public async authenticate(accessToken: string): Promise<Actor> {
    const claims = await this.tokenSigner.verifyAccessToken(accessToken);

    if (!claims) {
      throw new UnauthenticatedException();
    }

    return { accountId: claims.accountId, email: claims.email };
  }

  private async issueTokens(account: Account): Promise<TokenPair> {
    const accountId = account.id.value;
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenSigner.signAccessToken({
        accountId,
        email: account.email.value,
      }),
      this.tokenSigner.signRefreshToken({ accountId }),
    ]);

    return { accessToken, refreshToken };
  }
}
