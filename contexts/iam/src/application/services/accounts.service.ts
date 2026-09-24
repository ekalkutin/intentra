import { Inject, Injectable } from '@nestjs/common';

import type { AccountDto, AccountsApi } from '@intentra/iam-contracts';

import { AccountRepository } from '../ports/index.js';

@Injectable()
export class AccountsService implements AccountsApi {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async find(): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.find();
    return accounts.map(account => ({
      id: account.id.value,
      email: account.email,
    }));
  }
}
