import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AccountId, Timestamp } from '@intentra/shared';

import { PersonalAccessTokenRepository } from '../../application/ports/index.js';
import { PersonalAccessToken } from '../../domain/entities/index.js';
import {
  PersonalAccessTokenId,
  PersonalAccessTokenName,
} from '../../domain/value-objects/index.js';
import { PersonalAccessTokenModel } from '../database/index.js';

@Injectable()
export class PersonalAccessTokenRepositoryAdapter extends PersonalAccessTokenRepository {
  constructor(
    @InjectModel(PersonalAccessTokenModel.name)
    private readonly tokenModel: Model<PersonalAccessTokenModel>,
  ) {
    super();
  }

  public async save(token: PersonalAccessToken): Promise<void> {
    await this.tokenModel
      .replaceOne(
        { _id: token.id.value },
        {
          accountId: token.accountId.value,
          name: token.name.value,
          secretHash: token.secretHash,
          createdAt: token.createdAt.toDate(),
          expiresAt: token.expiresAt?.toDate() ?? null,
          revokedAt: token.revokedAt?.toDate() ?? null,
        },
        { upsert: true },
      )
      .exec();
  }

  public async findByAccount(
    accountId: AccountId,
  ): Promise<PersonalAccessToken[]> {
    const tokens = await this.tokenModel
      .find({ accountId: accountId.value })
      .sort({ createdAt: -1 })
      .exec();
    return tokens.map(token => this.toDomain(token));
  }

  public async findById(
    accountId: AccountId,
    id: PersonalAccessTokenId,
  ): Promise<PersonalAccessToken | null> {
    const token = await this.tokenModel
      .findOne({ _id: id.value, accountId: accountId.value })
      .exec();
    return token ? this.toDomain(token) : null;
  }

  public async findBySecretHash(
    secretHash: string,
  ): Promise<PersonalAccessToken | null> {
    const token = await this.tokenModel.findOne({ secretHash }).exec();
    return token ? this.toDomain(token) : null;
  }

  private toDomain(token: PersonalAccessTokenModel): PersonalAccessToken {
    return PersonalAccessToken.reconstitute(
      new PersonalAccessTokenId(token._id),
      {
        accountId: new AccountId(token.accountId),
        name: new PersonalAccessTokenName(token.name),
        secretHash: token.secretHash,
        createdAt: Timestamp.fromDate(token.createdAt),
        expiresAt: token.expiresAt && Timestamp.fromDate(token.expiresAt),
        revokedAt: token.revokedAt && Timestamp.fromDate(token.revokedAt),
      },
    );
  }
}
