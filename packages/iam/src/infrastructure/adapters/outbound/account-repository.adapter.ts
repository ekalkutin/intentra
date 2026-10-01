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
  type AccountListProps,
  type AccountQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Account } from '../../../domain/entities/index.js';
import { AccountModel } from '../../database/index.js';

@Injectable()
export class AccountRepositoryAdapter extends AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(account: Account): Promise<void> {
    try {
      await this.accountModel
        .replaceOne(
          { _id: account.id.value },
          {
            email: account.email.value,
            name: account.name.value,
            passwordHash: account.passwordHash,
            isPlatformAdmin: account.isPlatformAdmin,
            isBlocked: account.isBlocked,
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

  public async findMany(props: AccountListProps): Promise<Account[]> {
    const filter =
      props.isPlatformAdmin === undefined
        ? {}
        : props.isPlatformAdmin
          ? { isPlatformAdmin: true }
          : { isPlatformAdmin: false };
    const documents = await this.accountModel
      .find(filter)
      .sort({ email: 1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  private toDomain(document: AccountModel): Account {
    return Account.restore({
      id: document._id.toHexString(),
      email: document.email,
      name: document.name,
      passwordHash: document.passwordHash,
      isPlatformAdmin: document.isPlatformAdmin,
      isBlocked: document.isBlocked,
    });
  }
}

export const ACCOUNT_REPOSITORY_PROVIDER: Provider = {
  provide: AccountRepository,
  useClass: AccountRepositoryAdapter,
};
