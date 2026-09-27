import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { type RefreshDto, type TokensDto } from '@intentra/contracts/iam';

import {
  AccountNotFoundException,
  InvalidCredentialsException,
} from '../../../exceptions/index.js';
import { AccountRepository, TokenIssuer } from '../../../ports/index.js';

export class RefreshCommand extends Command<TokensDto> {
  constructor(public readonly payload: RefreshDto) {
    super();
  }
}

/**
 * The account may be gone while the token lives; for the caller that is a bad
 * token, not a missing account.
 */
@CommandHandler(RefreshCommand)
export class RefreshCommandHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,

    @Inject(TokenIssuer)
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  public async execute({ payload }: RefreshCommand): Promise<TokensDto> {
    const accountId = await this.tokenIssuer.verifyRefreshToken(
      payload.refreshToken,
    );
    if (!accountId) {
      throw new InvalidCredentialsException();
    }

    try {
      const account = await this.accountRepository.getById(accountId);
      return await this.tokenIssuer.issue(account.id);
    } catch (error) {
      if (error instanceof AccountNotFoundException) {
        throw new InvalidCredentialsException();
      }
      throw error;
    }
  }
}
