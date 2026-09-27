import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { type SignUpDto, type TokensDto } from '@intentra/contracts/iam';

import { Account } from '../../../../domain/entities/index.js';
import { Email } from '../../../../domain/value-objects/index.js';
import { EmailAlreadyTakenException } from '../../../exceptions/index.js';
import {
  AccountRepository,
  PasswordHasher,
  TokenIssuer,
} from '../../../ports/index.js';

export class SignUpAccountCommand extends Command<TokensDto> {
  constructor(public readonly payload: SignUpDto) {
    super();
  }
}

/** A new account is signed in right away. */
@CommandHandler(SignUpAccountCommand)
export class SignUpAccountCommandHandler implements ICommandHandler<SignUpAccountCommand> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,

    @Inject(PasswordHasher)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TokenIssuer)
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  public async execute({ payload }: SignUpAccountCommand): Promise<TokensDto> {
    const email = new Email(payload.email);
    if (await this.accountRepository.findByEmail(email)) {
      throw new EmailAlreadyTakenException();
    }

    const account = Account.signUp({
      email,
      passwordHash: await this.passwordHasher.hash(payload.password),
    });
    await this.accountRepository.save(account);

    return this.tokenIssuer.issue(account.id);
  }
}
