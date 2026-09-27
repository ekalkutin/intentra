import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AccountRepository } from '../application/account-repository.port.js';
import { AccountId } from '../domain/account-id.vo.js';
import { Account } from '../domain/account.aggregate.js';

import { AccountModel } from './account.schema.js';

@Injectable()
export class AccountRepositoryAdapter extends AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountModel>,
  ) {
    super();
  }

  public async save(account: Account): Promise<void> {
    const accountModel = new this.accountModel({
      _id: account.id.value,
      email: account.email,
      password: account.password,
    });
    await accountModel.save();
  }

  public async find(): Promise<Account[]> {
    const accounts = await this.accountModel.find().exec();
    return accounts.map(account =>
      Account.reconstitute(new AccountId(account._id), {
        email: account.email,
        password: account.password,
      }),
    );
  }
}
