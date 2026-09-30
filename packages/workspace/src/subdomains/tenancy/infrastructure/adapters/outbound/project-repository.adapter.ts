import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import {
  isDuplicateKeyError,
  MongooseUnitOfWork,
} from '@intentra/platform-persistence';
import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { ProjectSlugTakenException } from '../../../application/exceptions/index.js';
import {
  ProjectRepository,
  type ProjectQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Project } from '../../../domain/entities/index.js';
import { ProjectModel } from '../../database/index.js';

@Injectable()
export class ProjectRepositoryAdapter extends ProjectRepository {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(project: Project): Promise<void> {
    try {
      await this.projectModel
        .replaceOne(
          { _id: project.id.value },
          {
            workspaceId: project.workspaceId.value,
            name: project.name.value,
            slug: project.slug.value,
            createdBy: project.createdBy.value,
          },
          { upsert: true, session: this.unitOfWork.requireSession() },
        )
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ProjectSlugTakenException();
      }
      throw error;
    }
  }

  public async findOne(props: ProjectQueryProps): Promise<Project | null> {
    const document = await this.projectModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(props: ProjectQueryProps): Promise<Project[]> {
    const documents = await this.projectModel
      .find(this.toFilter(props))
      .sort({ name: 1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  public async delete(id: ProjectId): Promise<void> {
    await this.projectModel
      .deleteOne({ _id: id.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  public async deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void> {
    await this.projectModel
      .deleteMany({ workspaceId: props.workspaceId.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toFilter(props: ProjectQueryProps) {
    return {
      workspaceId: props.workspaceId.value,
      ...(props.id && { _id: props.id.value }),
    };
  }

  private toDomain(document: ProjectModel): Project {
    return Project.restore({
      id: document._id.toHexString(),
      workspaceId: document.workspaceId.toHexString(),
      name: document.name,
      slug: document.slug,
      createdBy: document.createdBy.toHexString(),
    });
  }
}

export const PROJECT_REPOSITORY_PROVIDER: Provider = {
  provide: ProjectRepository,
  useClass: ProjectRepositoryAdapter,
};
