import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';
import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  KnowledgeKeyCounter,
  type KnowledgeItemDeleteProps,
} from '../../../application/ports/outbound/index.js';
import type { KnowledgeKind } from '../../../domain/value-objects/index.js';
import { KnowledgeKeyCounterModel } from '../../database/index.js';

/** One counter document per Project and Kind, bumped with `$inc` in the caller's transaction. */
@Injectable()
export class KnowledgeKeyCounterAdapter implements KnowledgeKeyCounter {
  constructor(
    @InjectModel(KnowledgeKeyCounterModel.name)
    private readonly knowledgeKeyCounterModel: Model<KnowledgeKeyCounterModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {}

  public async next(props: {
    readonly workspaceId: WorkspaceId;
    readonly projectId: ProjectId;
    readonly kind: KnowledgeKind;
  }): Promise<number> {
    const counter = await this.knowledgeKeyCounterModel
      .findOneAndUpdate(
        { projectId: props.projectId.value, kind: props.kind.value },
        {
          $inc: { lastNumber: 1 },
          $setOnInsert: { workspaceId: props.workspaceId.value },
        },
        {
          upsert: true,
          returnDocument: 'after',
          session: this.unitOfWork.requireSession(),
        },
      )
      .lean()
      .exec();

    return counter.lastNumber;
  }

  public async deleteMany(props: KnowledgeItemDeleteProps): Promise<void> {
    await this.knowledgeKeyCounterModel
      .deleteMany(
        'workspaceId' in props
          ? { workspaceId: props.workspaceId.value }
          : { projectId: props.projectId.value },
      )
      .session(this.unitOfWork.requireSession())
      .exec();
  }
}

export const KNOWLEDGE_KEY_COUNTER_PROVIDER: Provider = {
  provide: KnowledgeKeyCounter,
  useClass: KnowledgeKeyCounterAdapter,
};
