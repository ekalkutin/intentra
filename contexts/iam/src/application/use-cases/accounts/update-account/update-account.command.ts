import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { UpdateAccountDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { DisplayName } from '../../../../domain/value-objects/index.js';
import { AccountRepository } from '../../../ports/index.js';

export class UpdateAccountCommand extends Command<string> {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateAccountDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateAccountCommand)
export class UpdateAccountCommandHandler implements ICommandHandler<UpdateAccountCommand> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async execute({ id, payload }: UpdateAccountCommand): Promise<string> {
    const account = await this.accountRepository.getById(new AccountId(id));
    account.rename(
      payload.displayName?.trim() ? new DisplayName(payload.displayName) : null,
    );
    await this.accountRepository.save(account);
    return account.id.value;
  }
}
