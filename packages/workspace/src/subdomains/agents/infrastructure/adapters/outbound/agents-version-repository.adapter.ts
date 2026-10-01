import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import {
  AgentsVersionRepository,
  type AgentsVersionQueryProps,
} from '../../../application/ports/outbound/index.js';
import { AgentsVersion } from '../../../domain/entities/index.js';
import {
  AgentsVersionModel,
  toAgentsContent,
  toAgentsContentDocument,
} from '../../database/index.js';

const NEWEST_FIRST = { number: -1 } as const;

@Injectable()
export class AgentsVersionRepositoryAdapter extends AgentsVersionRepository {
  constructor(
    @InjectModel(AgentsVersionModel.name)
    private readonly agentsVersionModel: Model<AgentsVersionModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(version: AgentsVersion): Promise<void> {
    await this.agentsVersionModel.create(
      [
        {
          _id: version.id.value,
          number: version.number.value,
          content: toAgentsContentDocument(version.content),
          note: version.note?.value ?? null,
          publisherAccountId: version.publisher.accountId.value,
          publisherEmail: version.publisher.email.value,
          publishedAt: new Date(version.publishedAt.epochMilliseconds),
        },
      ],
      { session: this.unitOfWork.requireSession() },
    );
  }

  public async findOne(
    props: AgentsVersionQueryProps,
  ): Promise<AgentsVersion | null> {
    const document = await this.agentsVersionModel
      .findOne('number' in props ? { number: props.number.value } : {})
      .sort(NEWEST_FIRST)
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(): Promise<AgentsVersion[]> {
    const documents = await this.agentsVersionModel
      .find()
      .sort(NEWEST_FIRST)
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  private toDomain(document: AgentsVersionModel): AgentsVersion {
    return AgentsVersion.restore({
      id: document._id.toHexString(),
      number: document.number,
      content: toAgentsContent(document.content),
      note: document.note,
      publisherAccountId: document.publisherAccountId.toHexString(),
      publisherEmail: document.publisherEmail,
      publishedAt: Temporal.Instant.fromEpochMilliseconds(
        document.publishedAt.getTime(),
      ),
    });
  }
}

export const AGENTS_VERSION_REPOSITORY_PROVIDER: Provider = {
  provide: AgentsVersionRepository,
  useClass: AgentsVersionRepositoryAdapter,
};
