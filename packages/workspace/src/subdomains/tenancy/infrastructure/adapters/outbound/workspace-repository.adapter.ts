import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import {
  isDuplicateKeyError,
  MongooseUnitOfWork,
} from '@intentra/platform-persistence';
import type { WorkspaceId } from '@intentra/shared-kernel';

import { WorkspaceSlugTakenException } from '../../../application/exceptions/index.js';
import {
  WorkspaceRepository,
  type WorkspaceQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Workspace } from '../../../domain/entities/index.js';
import { WorkspaceModel } from '../../database/index.js';

@Injectable()
export class WorkspaceRepositoryAdapter extends WorkspaceRepository {
  constructor(
    @InjectModel(WorkspaceModel.name)
    private readonly workspaceModel: Model<WorkspaceModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(workspace: Workspace): Promise<void> {
    try {
      await this.workspaceModel
        .replaceOne(
          { _id: workspace.id.value },
          {
            name: workspace.name.value,
            slug: workspace.slug.value,
          },
          { upsert: true, session: this.unitOfWork.requireSession() },
        )
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new WorkspaceSlugTakenException();
      }
      throw error;
    }
  }

  public async delete(id: WorkspaceId): Promise<void> {
    await this.workspaceModel
      .deleteOne({ _id: id.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  public async lock(id: WorkspaceId): Promise<void> {
    await this.workspaceModel
      .updateOne({ _id: id.value }, { $inc: { lockVersion: 1 } })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  public async findOne(props: WorkspaceQueryProps): Promise<Workspace | null> {
    const document = await this.workspaceModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(props: WorkspaceQueryProps): Promise<Workspace[]> {
    const documents = await this.workspaceModel
      .find(this.toFilter(props))
      .sort({ name: 1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  private toFilter(props: WorkspaceQueryProps) {
    return {
      ...(props.id && { _id: props.id.value }),
      ...(props.ids && { _id: { $in: props.ids.map(id => id.value) } }),
    };
  }

  private toDomain(document: WorkspaceModel): Workspace {
    return Workspace.restore({
      id: document._id.toHexString(),
      name: document.name,
      slug: document.slug,
    });
  }
}

export const WORKSPACE_REPOSITORY_PROVIDER: Provider = {
  provide: WorkspaceRepository,
  useClass: WorkspaceRepositoryAdapter,
};
