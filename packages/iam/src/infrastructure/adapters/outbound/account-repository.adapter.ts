import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import {
  isDuplicateKeyError,
  MongooseUnitOfWork,
} from '@intentra/platform-persistence';

import { AccountAlreadyExistsException } from '../../../application/exceptions/index.js';
import {
  AccountRepository,
  type AccountQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Account } from '../../../domain/entities/index.js';
import { AccountModel } from '../../database/index.js';

@Injectable()
export class AccountRepositoryAdapter implements AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
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
          { upsert: true, session: this.unitOfWork.requireSession() },
        )
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AccountAlreadyExistsException();
      }
      throw error;
    }
  }

  public async findOne(props: AccountQueryProps): Promise<Account | null> {
    const filter =
      'id' in props ? { _id: props.id.value } : { email: props.email.value };
    const document = await this.accountModel
      .findOne(filter)
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  private toDomain(document: AccountModel): Account {
    return Account.restore({
      id: document._id.toHexString(),
      email: document.email,
      passwordHash: document.passwordHash,
    });
  }
}

export const ACCOUNT_REPOSITORY_PROVIDER: Provider = {
  provide: AccountRepository,
  useClass: AccountRepositoryAdapter,
};
