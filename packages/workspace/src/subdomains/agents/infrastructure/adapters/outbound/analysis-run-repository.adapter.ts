import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import {
  isDuplicateKeyError,
  MongooseUnitOfWork,
} from '@intentra/platform-persistence';
import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { AnalysisRunBusyException } from '../../../application/exceptions/index.js';
import {
  AnalysisRunRepository,
  type AnalysisRunPage,
  type AnalysisRunQueryProps,
} from '../../../application/ports/outbound/index.js';
import { AnalysisRun } from '../../../domain/entities/index.js';
import { AnalysisRunModel } from '../../database/index.js';

const NEWEST_FIRST = { startedAt: -1 } as const;

@Injectable()
export class AnalysisRunRepositoryAdapter extends AnalysisRunRepository {
  constructor(
    @InjectModel(AnalysisRunModel.name)
    private readonly analysisRunModel: Model<AnalysisRunModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(run: AnalysisRun): Promise<void> {
    try {
      await this.analysisRunModel
        .replaceOne(
          { _id: run.id.value },
          {
            workspaceId: run.workspaceId.value,
            projectId: run.projectId.value,
            scope: run.scope.value,
            changedKeys: [...run.changedKeys],
            startedBy: run.startedBy?.value ?? null,
            startedAt: toDate(run.startedAt),
            agentsVersion: run.agentsVersion?.value ?? null,
            status: run.status.value,
            finishedAt: run.finishedAt && toDate(run.finishedAt),
            questionKeys: [...run.questionKeys],
            stepLimitReached: run.stepLimitReached,
            failure: run.failure?.value ?? null,
          },
          { upsert: true, session: this.unitOfWork.requireSession() },
        )
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AnalysisRunBusyException();
      }
      throw error;
    }
  }

  public async findOne(
    props: AnalysisRunQueryProps,
  ): Promise<AnalysisRun | null> {
    const document = await this.analysisRunModel
      .findOne(toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && toDomain(document);
  }

  public async findMany(
    props: AnalysisRunQueryProps,
    page?: AnalysisRunPage,
  ): Promise<AnalysisRun[]> {
    let query = this.analysisRunModel
      .find(toFilter(props))
      .sort(NEWEST_FIRST)
      .session(this.unitOfWork.session);
    if (page) {
      query = query.skip(page.offset).limit(page.take);
    }
    const documents = await query.lean().exec();

    return documents.map(toDomain);
  }

  public async count(props: AnalysisRunQueryProps): Promise<number> {
    return this.analysisRunModel
      .countDocuments(toFilter(props))
      .session(this.unitOfWork.session)
      .exec();
  }

  public async deleteMany(
    props:
      { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId },
  ): Promise<void> {
    await this.analysisRunModel
      .deleteMany(
        'workspaceId' in props
          ? { workspaceId: props.workspaceId.value }
          : { projectId: props.projectId.value },
      )
      .session(this.unitOfWork.requireSession())
      .exec();
  }
}

function toFilter(props: AnalysisRunQueryProps) {
  return {
    ...(props.id && { _id: props.id.value }),
    ...(props.projectId && { projectId: props.projectId.value }),
    ...(props.status && { status: props.status.value }),
  };
}

function toDomain(document: AnalysisRunModel): AnalysisRun {
  return AnalysisRun.restore({
    id: document._id.toHexString(),
    workspaceId: document.workspaceId.toHexString(),
    projectId: document.projectId.toHexString(),
    scope: document.scope,
    changedKeys: document.changedKeys,
    startedBy: document.startedBy?.toHexString() ?? null,
    startedAt: toInstant(document.startedAt),
    agentsVersion: document.agentsVersion,
    status: document.status,
    finishedAt: document.finishedAt && toInstant(document.finishedAt),
    questionKeys: document.questionKeys,
    stepLimitReached: document.stepLimitReached,
    failure: document.failure,
  });
}

function toDate(instant: Temporal.Instant): Date {
  return new Date(instant.epochMilliseconds);
}

function toInstant(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

export const ANALYSIS_RUN_REPOSITORY_PROVIDER: Provider = {
  provide: AnalysisRunRepository,
  useClass: AnalysisRunRepositoryAdapter,
};
