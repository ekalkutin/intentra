import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongo, type Model } from 'mongoose';

import type { AccountId } from '@intentra/shared-kernel';

import { AccountAlreadyExistsException } from '../../../application/exceptions/index.js';
import { AccountRepository } from '../../../application/ports/outbound/index.js';
import { Account } from '../../../domain/entities/index.js';
import type { Email } from '../../../domain/value-objects/index.js';
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

  public async findById(id: AccountId): Promise<Account | null> {
    const document = await this.accountModel.findById(id.value).lean().exec();

    return document && this.toDomain(document);
  }

  public async findByEmail(email: Email): Promise<Account | null> {
    const document = await this.accountModel
      .findOne({ email: email.value })
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  private toDomain(document: AccountModel): Account {
    return Account.restore({
      id: document._id,
      email: document.email,
      passwordHash: document.passwordHash,
    });
  }
}

export const ACCOUNT_REPOSITORY_PROVIDER: Provider = {
  provide: AccountRepository,
  useClass: AccountRepositoryAdapter,
};
