import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SignInDto, TokensDto } from '@intentra/iam-contracts';

import { AccountRepository } from '../../../../domain/repositories/index.js';
import { InvalidCredentials } from '../../../exceptions/index.js';
import { PasswordHasher } from '../../../ports/index.js';
import { TokenIssuer } from '../../../services/token-issuer.service.js';

export class SignInCommand extends Command<TokensDto> {
  constructor(public readonly payload: SignInDto) {
    super();
  }
}

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<SignInCommand> {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  public async execute(command: SignInCommand): Promise<TokensDto> {
    const { payload } = command;

    const account = await this.accounts.findByEmail(payload.email);

    // Отказ одинаков и когда адрес неизвестен, и когда пароль не тот: иначе
    // вызывающий мог бы выяснить, какие учётные записи существуют.
    if (!account) {
      throw new InvalidCredentials();
    }

    const passwordMatches = this.passwordHasher.compare(
      payload.password,
      account.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentials();
    }

    return this.tokenIssuer.sign(account);
  }
}
