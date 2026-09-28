import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongo, type Model } from 'mongoose';

import { AccountAlreadyExistsException } from '../../../application/exceptions/index.js';
import { AccountRepository } from '../../../application/ports/outbound/index.js';
import { Account } from '../../../domain/entities/index.js';
import { AccountModel } from '../../database/index.js';

const DUPLICATE_KEY_ERROR_CODE = 11000;

@Injectable()
export class AccountRepositoryAdapter implements AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountModel>,
  ) {}

  public async save(account: Account): Promise<void> {
    try {
      await this.accountModel
        .replaceOne(
          { _id: account.id.value },
          {
            email: account.email.value,
            passwordHash: account.passwordHash,
          },
          { upsert: true },
        )
        .exec();
    } catch (error) {
      if (
        error instanceof mongo.MongoServerError &&
        error.code === DUPLICATE_KEY_ERROR_CODE
      ) {
        throw new AccountAlreadyExistsException();
      }
      throw error;
    }
  }
}

export const ACCOUNT_REPOSITORY_PROVIDER: Provider = {
  provide: AccountRepository,
  useClass: AccountRepositoryAdapter,
};
