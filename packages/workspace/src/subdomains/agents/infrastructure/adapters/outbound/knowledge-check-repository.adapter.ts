import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';
import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { KnowledgeCheckRepository } from '../../../application/ports/outbound/index.js';
import { KnowledgeCheck } from '../../../domain/value-objects/index.js';
import { KnowledgeCheckModel } from '../../database/index.js';

@Injectable()
export class KnowledgeCheckRepositoryAdapter extends KnowledgeCheckRepository {
  constructor(
    @InjectModel(KnowledgeCheckModel.name)
    private readonly knowledgeCheckModel: Model<KnowledgeCheckModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    check: KnowledgeCheck,
  ): Promise<void> {
    await this.knowledgeCheckModel
      .replaceOne(
        { projectId: projectId.value, key: check.key },
        {
          workspaceId: workspaceId.value,
          projectId: projectId.value,
          key: check.key,
          version: check.version,
          checkedAt: new Date(check.checkedAt.epochMilliseconds),
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findMany(props: {
    readonly projectId: ProjectId;
  }): Promise<KnowledgeCheck[]> {
    const documents = await this.knowledgeCheckModel
      .find({ projectId: props.projectId.value })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(toDomain);
  }

  public async deleteMany(
    props:
      { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId },
  ): Promise<void> {
    await this.knowledgeCheckModel
      .deleteMany(
        'workspaceId' in props
          ? { workspaceId: props.workspaceId.value }
          : { projectId: props.projectId.value },
      )
      .session(this.unitOfWork.requireSession())
      .exec();
  }
}

function toDomain(document: KnowledgeCheckModel): KnowledgeCheck {
  return new KnowledgeCheck({
    key: document.key,
    version: document.version,
    checkedAt: Temporal.Instant.fromEpochMilliseconds(
      document.checkedAt.getTime(),
    ),
  });
}

export const KNOWLEDGE_CHECK_REPOSITORY_PROVIDER: Provider = {
  provide: KnowledgeCheckRepository,
  useClass: KnowledgeCheckRepositoryAdapter,
};
