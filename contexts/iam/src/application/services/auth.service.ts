import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type {
  AccountDto,
  AuthApi,
  RefreshDto,
  SignInDto,
  SignUpDto,
  TokensDto,
} from '@intentra/contracts/iam';

import { AccountNotFoundException } from '../exceptions/index.js';
import { toAccountDto } from '../mappers/index.js';
import { AccountRepository, TokenIssuer } from '../ports/index.js';
import {
  RefreshCommand,
  SignInCommand,
  SignUpCommand,
} from '../use-cases/auth/index.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(TokenIssuer)
    private readonly tokenIssuer: TokenIssuer,

    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async signUp(data: SignUpDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignUpCommand(data));
  }

  public async signIn(data: SignInDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignInCommand(data));
  }

  public async refresh(data: RefreshDto): Promise<TokensDto> {
    return this.commandBus.execute(new RefreshCommand(data));
  }

  /** Read on every request, so a change to the account shows at once. */
  public async verifyAccessToken(
    accessToken: string,
  ): Promise<AccountDto | null> {
    const accountId = await this.tokenIssuer.verifyAccessToken(accessToken);
    if (!accountId) {
      return null;
    }

    try {
      return toAccountDto(await this.accountRepository.getById(accountId));
    } catch (error) {
      // A token of a deleted account is not valid any more.
      if (error instanceof AccountNotFoundException) {
        return null;
      }
      throw error;
    }
  }
}
