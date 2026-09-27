import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { SignUpDto, TokensDto } from '@intentra/contracts/iam';

import { Account } from '../../../../domain/entities/account.aggregate.js';
import { AccountRepository } from '../../../ports/account-repository.port.js';
import { PasswordHasher } from '../../../ports/password-hasher.port.js';

export class SignUpCommand extends Command<TokensDto> {
  constructor(public readonly payload: SignUpDto) {
    super();
  }
}

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,

    @Inject(PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(command: SignUpCommand): Promise<TokensDto> {
    const { payload } = command;

    const account = Account.signUp(
      payload.email,
      await this.passwordHasher.hash(payload.password),
    );

    await this.accountRepository.save(account);

    return {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
    };
  }
}
