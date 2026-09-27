import { Inject, Injectable } from '@nestjs/common';

import { AccountRepository } from '../../application/ports/account-repository.port.js';
import { Account } from '../../domain/account/account.aggregate.js';
import { AccountId } from '../../domain/value-objects/account-id.vo.js';
import { IamDatabase } from '../database/iam-database.js';

@Injectable()
export class AccountRepositoryAdapter extends AccountRepository {
  constructor(
    @Inject(IamDatabase)
    private readonly database: IamDatabase,
  ) {
    super();
  }

  public async save(account: Account): Promise<void> {
    await this.database.orm.public.Account.create({
      id: account.id.value,
      email: account.email,
      password: account.password,
    });
  }

  public async find(): Promise<Account[]> {
    const accounts = await this.database.orm.public.Account.all();
    return accounts.map(account =>
      Account.reconstitute(new AccountId(account.id), {
        email: account.email,
        password: account.password,
      }),
    );
  }
}
