import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';
import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  AnalysisScheduleRepository,
  type AnalysisScheduleQueryProps,
} from '../../../application/ports/outbound/index.js';
import { AnalysisSchedule } from '../../../domain/entities/index.js';
import { AnalysisScheduleModel } from '../../database/index.js';

@Injectable()
export class AnalysisScheduleRepositoryAdapter extends AnalysisScheduleRepository {
  constructor(
    @InjectModel(AnalysisScheduleModel.name)
    private readonly analysisScheduleModel: Model<AnalysisScheduleModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(schedule: AnalysisSchedule): Promise<void> {
    await this.analysisScheduleModel
      .replaceOne(
        { _id: schedule.id.value },
        {
          workspaceId: schedule.workspaceId.value,
          projectId: schedule.projectId.value,
          enabled: schedule.enabled,
          changedBy: schedule.changedBy.value,
          changedAt: new Date(schedule.changedAt.epochMilliseconds),
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(
    props: AnalysisScheduleQueryProps,
  ): Promise<AnalysisSchedule | null> {
    const document = await this.analysisScheduleModel
      .findOne(toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && toDomain(document);
  }

  public async findMany(
    props: AnalysisScheduleQueryProps,
  ): Promise<AnalysisSchedule[]> {
    const documents = await this.analysisScheduleModel
      .find(toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(toDomain);
  }

  public async deleteMany(
    props:
      { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId },
  ): Promise<void> {
    await this.analysisScheduleModel
      .deleteMany(
        'workspaceId' in props
          ? { workspaceId: props.workspaceId.value }
          : { projectId: props.projectId.value },
      )
      .session(this.unitOfWork.requireSession())
      .exec();
  }
}

function toFilter(props: AnalysisScheduleQueryProps) {
  return {
    ...(props.projectId && { projectId: props.projectId.value }),
    ...(props.enabled !== undefined && { enabled: props.enabled }),
  };
}

function toDomain(document: AnalysisScheduleModel): AnalysisSchedule {
  return AnalysisSchedule.restore({
    id: document._id.toHexString(),
    workspaceId: document.workspaceId.toHexString(),
    projectId: document.projectId.toHexString(),
    enabled: document.enabled,
    changedBy: document.changedBy.toHexString(),
    changedAt: Temporal.Instant.fromEpochMilliseconds(
      document.changedAt.getTime(),
    ),
  });
}

export const ANALYSIS_SCHEDULE_REPOSITORY_PROVIDER: Provider = {
  provide: AnalysisScheduleRepository,
  useClass: AnalysisScheduleRepositoryAdapter,
};
