import { Injectable } from '@nestjs/common';

import type {
  Actor,
  AuthApi,
  RefreshTokensDto,
  RegisterAccountDto,
  SignInDto,
  SignUpContext,
  TokenPair,
} from '@intentra/contracts/iam';
import { AccountId, Email, UnitOfWork } from '@intentra/shared-kernel';

import { Account } from '../../domain/entities/index.js';
import {
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UnauthenticatedException,
} from '../exceptions/index.js';
import {
  AccountRepository,
  PasswordHasher,
  SignUpSettingsRepository,
  TokenSigner,
} from '../ports/outbound/index.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accountRepository: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
    private readonly signUpSettingsRepository: SignUpSettingsRepository,
  ) {}

  public async register(
    data: RegisterAccountDto,
    { invited }: SignUpContext,
  ): Promise<void> {
    const settings = await this.signUpSettingsRepository.getOne();
    settings.ensureAllows(invited);
    const passwordHash = await this.passwordHasher.hash(data.password);
    const account = Account.register({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    await this.unitOfWork.run(() => this.accountRepository.save(account));
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
    account.ensureNotBlocked();

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
    account.ensureNotBlocked();

    return this.issueTokens(account);
  }

  public async authenticate(accessToken: string): Promise<Actor> {
    const claims = await this.tokenSigner.verifyAccessToken(accessToken);

    if (!claims) {
      throw new UnauthenticatedException();
    }

    return {
      accountId: claims.accountId,
      email: claims.email,
      name: claims.name,
      isPlatformAdmin: claims.isPlatformAdmin,
    };
  }

  private async issueTokens(account: Account): Promise<TokenPair> {
    const accountId = account.id.value;
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenSigner.signAccessToken({
        accountId,
        email: account.email.value,
        name: account.name.value,
        isPlatformAdmin: account.isPlatformAdmin,
      }),
      this.tokenSigner.signRefreshToken({ accountId }),
    ]);

    return { accessToken, refreshToken };
  }
}
