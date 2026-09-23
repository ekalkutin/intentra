import { Inject, Injectable } from '@nestjs/common';

import { AccountApi, AccountDto } from '@intentra/iam-contracts';

import { AccountRepository } from '../../application/ports/index.js';

@Injectable()
export class AccountApiAdapter extends AccountApi {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {
    super();
  }

  public async find(): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.find();
    return accounts.map(account => ({
      id: account.id.value,
      email: account.email,
    }));
  }
}
