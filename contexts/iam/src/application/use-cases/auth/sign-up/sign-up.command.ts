import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SignUpDto, TokensDto } from '@intentra/iam-contracts';

import { Account } from '../../../../domain/entities/index.js';
import { AccountRepository } from '../../../../domain/repositories/index.js';
import { EmailAlreadyTaken } from '../../../exceptions/index.js';
import { PasswordHasher } from '../../../ports/index.js';
import { TokenIssuer } from '../../../services/token-issuer.service.js';

/**
 * Заводит только `Account`. Workspace человек создаёт следующим действием, уже
 * с этим токеном: это две транзакции в двух базах, и компенсация между ними не
 * нужна именно потому, что действия разные (ADR 0001).
 */
export class SignUpCommand extends Command<TokensDto> {
  constructor(public readonly payload: SignUpDto) {
    super();
  }
}

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  public async execute(command: SignUpCommand): Promise<TokensDto> {
    const { payload } = command;

    const existing = await this.accounts.findByEmail(payload.email);

    if (existing) {
      throw new EmailAlreadyTaken();
    }

    const account = Account.register({
      email: payload.email,
      passwordHash: this.passwordHasher.hash(payload.password),
    });

    await this.accounts.save(account);

    return this.tokenIssuer.sign(account);
  }
}
