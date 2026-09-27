import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { ChangePasswordDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { WrongPasswordException } from '../../../exceptions/index.js';
import { AccountRepository, PasswordHasher } from '../../../ports/index.js';

export class ChangeAccountPasswordCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly payload: ChangePasswordDto,
  ) {
    super();
  }
}

/** Issued tokens stay valid: they are stateless and expire on their own. */
@CommandHandler(ChangeAccountPasswordCommand)
export class ChangeAccountPasswordCommandHandler implements ICommandHandler<ChangeAccountPasswordCommand> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,

    @Inject(PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute({
    id,
    payload,
  }: ChangeAccountPasswordCommand): Promise<void> {
    const account = await this.accountRepository.getById(new AccountId(id));
    const matches = await this.passwordHasher.compare(
      payload.currentPassword,
      account.passwordHash,
    );
    if (!matches) {
      throw new WrongPasswordException();
    }

    account.changePassword(await this.passwordHasher.hash(payload.newPassword));
    await this.accountRepository.save(account);
  }
}
