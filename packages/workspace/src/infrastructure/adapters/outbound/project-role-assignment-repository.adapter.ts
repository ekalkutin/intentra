import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import {
  ProjectRoleAssignmentRepository,
  type ProjectRoleAssignmentDeleteProps,
  type ProjectRoleAssignmentQueryProps,
} from '../../../application/ports/outbound/index.js';
import { ProjectRoleAssignment } from '../../../domain/entities/index.js';
import { ProjectRoleAssignmentModel } from '../../database/index.js';

@Injectable()
export class ProjectRoleAssignmentRepositoryAdapter implements ProjectRoleAssignmentRepository {
  constructor(
    @InjectModel(ProjectRoleAssignmentModel.name)
    private readonly projectRoleAssignmentModel: Model<ProjectRoleAssignmentModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {}

  public async save(assignment: ProjectRoleAssignment): Promise<void> {
    await this.projectRoleAssignmentModel
      .replaceOne(
        { _id: assignment.id.value },
        {
          workspaceId: assignment.workspaceId.value,
          projectId: assignment.projectId.value,
          memberId: assignment.memberId.value,
          role: assignment.role.value,
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(
    props: ProjectRoleAssignmentQueryProps,
  ): Promise<ProjectRoleAssignment | null> {
    const document = await this.projectRoleAssignmentModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(
    props: ProjectRoleAssignmentQueryProps,
  ): Promise<ProjectRoleAssignment[]> {
    const documents = await this.projectRoleAssignmentModel
      .find(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  public async deleteMany(
    props: ProjectRoleAssignmentDeleteProps,
  ): Promise<void> {
    await this.projectRoleAssignmentModel
      .deleteMany(this.toDeleteFilter(props))
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toFilter(props: ProjectRoleAssignmentQueryProps) {
    return {
      projectId: props.projectId.value,
      ...(props.memberId && { memberId: props.memberId.value }),
    };
  }

  private toDeleteFilter(props: ProjectRoleAssignmentDeleteProps) {
    if ('workspaceId' in props) {
      return { workspaceId: props.workspaceId.value };
    }
    if ('projectId' in props) {
      return { projectId: props.projectId.value };
    }

    return { memberId: props.memberId.value };
  }

  private toDomain(
    document: ProjectRoleAssignmentModel,
  ): ProjectRoleAssignment {
    return ProjectRoleAssignment.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      projectId: document.projectId,
      memberId: document.memberId,
      role: document.role,
    });
  }
}

export const PROJECT_ROLE_ASSIGNMENT_REPOSITORY_PROVIDER: Provider = {
  provide: ProjectRoleAssignmentRepository,
  useClass: ProjectRoleAssignmentRepositoryAdapter,
};
