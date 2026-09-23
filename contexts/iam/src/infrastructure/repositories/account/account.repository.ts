import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AccountRepository } from '../../../application/ports/index.js';
import { Account } from '../../../domain/entities/index.js';
import { AccountId } from '../../../domain/value-objects/index.js';

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
    return accounts.map(
      account =>
        new Account(
          new AccountId(account._id),
          account.email,
          account.password,
        ),
    );
  }
}
