import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import { UnpublishedAgentsRepository } from '../../../application/ports/outbound/index.js';
import { UnpublishedAgents } from '../../../domain/entities/index.js';
import {
  toAgentsContent,
  toAgentsContentDocument,
  UnpublishedAgentsModel,
} from '../../database/index.js';

@Injectable()
export class UnpublishedAgentsRepositoryAdapter extends UnpublishedAgentsRepository {
  constructor(
    @InjectModel(UnpublishedAgentsModel.name)
    private readonly unpublishedAgentsModel: Model<UnpublishedAgentsModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(unpublished: UnpublishedAgents): Promise<void> {
    await this.unpublishedAgentsModel
      .replaceOne(
        { _id: unpublished.id.value },
        {
          content: toAgentsContentDocument(unpublished.content),
          publishedNumber: unpublished.publishedNumber.value,
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(): Promise<UnpublishedAgents | null> {
    const document = await this.unpublishedAgentsModel
      .findOne()
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  private toDomain(document: UnpublishedAgentsModel): UnpublishedAgents {
    return UnpublishedAgents.restore({
      id: document._id.toHexString(),
      content: toAgentsContent(document.content),
      publishedNumber: document.publishedNumber,
    });
  }
}

export const UNPUBLISHED_AGENTS_REPOSITORY_PROVIDER: Provider = {
  provide: UnpublishedAgentsRepository,
  useClass: UnpublishedAgentsRepositoryAdapter,
};
