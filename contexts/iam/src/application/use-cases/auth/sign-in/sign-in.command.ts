import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { type SignInDto, type TokensDto } from '@intentra/contracts/iam';

import { Email } from '../../../../domain/value-objects/index.js';
import { InvalidCredentialsException } from '../../../exceptions/index.js';
import {
  AccountRepository,
  PasswordHasher,
  TokenIssuer,
} from '../../../ports/index.js';

export class SignInCommand extends Command<TokensDto> {
  constructor(public readonly payload: SignInDto) {
    super();
  }
}

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<SignInCommand> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,

    @Inject(PasswordHasher)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TokenIssuer)
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  public async execute({ payload }: SignInCommand): Promise<TokensDto> {
    const account = await this.accountRepository.findByEmail(
      new Email(payload.email),
    );
    const matches =
      account !== null &&
      (await this.passwordHasher.compare(
        payload.password,
        account.passwordHash,
      ));
    if (!account || !matches) {
      throw new InvalidCredentialsException();
    }

    return this.tokenIssuer.issue(account.id);
  }
}
