import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { AccountDto, FindAccountsDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { AccountRepository } from '../../../ports/index.js';

export class FindManyAccountsQuery extends Query<AccountDto[]> {
  constructor(public readonly filter: FindAccountsDto) {
    super();
  }
}

@QueryHandler(FindManyAccountsQuery)
export class FindManyAccountsQueryHandler implements IQueryHandler<FindManyAccountsQuery> {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async execute({
    filter,
  }: FindManyAccountsQuery): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findByIds(
      filter.ids.map(id => new AccountId(id)),
    );
    return accounts.map(account => ({
      id: account.id.value,
      email: account.email.value,
      displayName: account.displayName?.value ?? null,
    }));
  }
}
