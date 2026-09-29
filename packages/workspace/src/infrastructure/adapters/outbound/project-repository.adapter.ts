import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongo, type Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import { ProjectSlugTakenException } from '../../../application/exceptions/index.js';
import {
  ProjectRepository,
  type ProjectQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Project } from '../../../domain/entities/index.js';
import { ProjectModel } from '../../database/index.js';

const DUPLICATE_KEY_ERROR_CODE = 11000;

@Injectable()
export class ProjectRepositoryAdapter implements ProjectRepository {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {}

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
      if (
        error instanceof mongo.MongoServerError &&
        error.code === DUPLICATE_KEY_ERROR_CODE
      ) {
        throw new ProjectSlugTakenException();
      }
      throw error;
    }
  }

  public async findMany(props: ProjectQueryProps): Promise<Project[]> {
    const documents = await this.projectModel
      .find({ workspaceId: props.workspaceId.value })
      .sort({ name: 1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  private toDomain(document: ProjectModel): Project {
    return Project.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      name: document.name,
      slug: document.slug,
      createdBy: document.createdBy,
    });
  }
}

export const PROJECT_REPOSITORY_PROVIDER: Provider = {
  provide: ProjectRepository,
  useClass: ProjectRepositoryAdapter,
};
