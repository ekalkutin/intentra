import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { AccountDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { AccountRepository } from '../../../ports/index.js';

export class GetOneAccountQuery extends Query<AccountDto> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetOneAccountQuery)
export class GetOneAccountQueryHandler implements IQueryHandler<GetOneAccountQuery> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async execute({ id }: GetOneAccountQuery): Promise<AccountDto> {
    const account = await this.accountRepository.getById(new AccountId(id));
    return { id: account.id.value, email: account.email.value };
  }
}
