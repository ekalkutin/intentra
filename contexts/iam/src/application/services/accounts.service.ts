import { Inject, Injectable } from '@nestjs/common';

import type { AccountDto, AccountsApi } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { toAccountDto } from '../mappers/index.js';
import { AccountRepository } from '../ports/index.js';

@Injectable()
export class AccountsService implements AccountsApi {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async getById(id: string): Promise<AccountDto> {
    const account = await this.accountRepository.getById(new AccountId(id));
    return toAccountDto(account);
  }
}
