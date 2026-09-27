import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AccountId } from '@intentra/shared';

import { AccountRepository } from '../../application/ports/index.js';
import { Account } from '../../domain/entities/index.js';
import { DisplayName, Email } from '../../domain/value-objects/index.js';
import { AccountModel } from '../database/index.js';

@Injectable()
export class AccountRepositoryAdapter extends AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountModel>,
  ) {
    super();
  }

  public async save(account: Account): Promise<void> {
    await this.accountModel
      .replaceOne(
        { _id: account.id.value },
        {
          email: account.email.value,
          passwordHash: account.passwordHash,
          displayName: account.displayName?.value ?? null,
        },
        { upsert: true },
      )
      .exec();
  }

  public async findById(id: AccountId): Promise<Account | null> {
    const account = await this.accountModel.findById(id.value).exec();
    return account ? this.toDomain(account) : null;
  }

  public async findByIds(ids: AccountId[]): Promise<Account[]> {
    const accounts = await this.accountModel
      .find({ _id: { $in: ids.map(id => id.value) } })
      .exec();
    return accounts.map(account => this.toDomain(account));
  }

  public async findByEmail(email: Email): Promise<Account | null> {
    const account = await this.accountModel
      .findOne({ email: email.value })
      .exec();
    return account ? this.toDomain(account) : null;
  }

  private toDomain(account: AccountModel): Account {
    return Account.reconstitute(new AccountId(account._id), {
      email: new Email(account.email),
      passwordHash: account.passwordHash,
      displayName: account.displayName
        ? new DisplayName(account.displayName)
        : null,
    });
  }
}
