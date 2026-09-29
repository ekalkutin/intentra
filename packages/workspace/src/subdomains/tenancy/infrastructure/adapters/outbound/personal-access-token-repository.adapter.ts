import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import {
  PersonalAccessTokenRepository,
  type PersonalAccessTokenDeleteProps,
  type PersonalAccessTokenQueryProps,
} from '../../../application/ports/outbound/index.js';
import { PersonalAccessToken } from '../../../domain/entities/index.js';
import type { PersonalAccessTokenId } from '../../../domain/value-objects/index.js';
import { PersonalAccessTokenModel } from '../../database/index.js';

@Injectable()
export class PersonalAccessTokenRepositoryAdapter extends PersonalAccessTokenRepository {
  constructor(
    @InjectModel(PersonalAccessTokenModel.name)
    private readonly personalAccessTokenModel: Model<PersonalAccessTokenModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(token: PersonalAccessToken): Promise<void> {
    await this.personalAccessTokenModel
      .replaceOne(
        { _id: token.id.value },
        {
          workspaceId: token.workspaceId.value,
          memberId: token.memberId.value,
          name: token.name.value,
          level: token.level.value,
          secretHash: token.secretHash.value,
          secretHint: token.secretHint.value,
          createdAt: toDate(token.createdAt),
          expiresAt: token.expiresAt && toDate(token.expiresAt),
          lastUsedAt: token.lastUsedAt && toDate(token.lastUsedAt),
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(
    props: PersonalAccessTokenQueryProps,
  ): Promise<PersonalAccessToken | null> {
    const document = await this.personalAccessTokenModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(
    props: PersonalAccessTokenQueryProps,
  ): Promise<PersonalAccessToken[]> {
    const documents = await this.personalAccessTokenModel
      .find(this.toFilter(props))
      .sort({ createdAt: -1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  public async delete(id: PersonalAccessTokenId): Promise<void> {
    await this.personalAccessTokenModel
      .deleteOne({ _id: id.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  public async deleteMany(
    props: PersonalAccessTokenDeleteProps,
  ): Promise<void> {
    await this.personalAccessTokenModel
      .deleteMany(
        'workspaceId' in props
          ? { workspaceId: props.workspaceId.value }
          : { memberId: props.memberId.value },
      )
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toFilter(props: PersonalAccessTokenQueryProps) {
    return {
      ...(props.id && { _id: props.id.value }),
      ...(props.workspaceId && { workspaceId: props.workspaceId.value }),
      ...(props.memberId && { memberId: props.memberId.value }),
      ...(props.secretHash && { secretHash: props.secretHash.value }),
    };
  }

  private toDomain(document: PersonalAccessTokenModel): PersonalAccessToken {
    return PersonalAccessToken.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      memberId: document.memberId,
      name: document.name,
      level: document.level,
      secretHash: document.secretHash,
      secretHint: document.secretHint,
      createdAt: toInstant(document.createdAt),
      expiresAt: document.expiresAt && toInstant(document.expiresAt),
      lastUsedAt: document.lastUsedAt && toInstant(document.lastUsedAt),
    });
  }
}

function toDate(instant: Temporal.Instant): Date {
  return new Date(instant.epochMilliseconds);
}

function toInstant(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

export const PERSONAL_ACCESS_TOKEN_REPOSITORY_PROVIDER: Provider = {
  provide: PersonalAccessTokenRepository,
  useClass: PersonalAccessTokenRepositoryAdapter,
};
