import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AccountRepository } from '../../../application/ports/index.js';
import { Account } from '../../../domain/entities/index.js';

import { AccountModel } from './account.schema.js';

@Injectable()
export class AccountRepositoryAdapter extends AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountModel>,
  ) {
    super();
  }

  public async find(): Promise<Account[]> {
    const accounts = await this.accountModel.find().exec();
    return accounts.map(() => new Account());
  }
}
