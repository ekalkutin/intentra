import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProjectId, WorkspaceId } from '@intentra/shared';

import { ProjectRepository } from '../../application/ports/index.js';
import { Project } from '../../domain/entities/index.js';
import { ProjectModel } from '../database/index.js';

@Injectable()
export class ProjectRepositoryAdapter extends ProjectRepository {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectModel>,
  ) {
    super();
  }

  public async save(project: Project): Promise<void> {
    const projectModel = new this.projectModel({
      _id: project.id.value,
      workspaceId: project.workspaceId.value,
      name: project.name,
      description: project.description,
    });
    await projectModel.save();
  }

  public async findByWorkspaces(
    workspaceIds: WorkspaceId[],
  ): Promise<Project[]> {
    const projects = await this.projectModel
      .find({ workspaceId: { $in: workspaceIds.map(id => id.value) } })
      .exec();
    return projects.map(project => this.toDomain(project));
  }

  private toDomain(project: ProjectModel): Project {
    return Project.reconstitute(new ProjectId(project._id), {
      workspaceId: new WorkspaceId(project.workspaceId),
      name: project.name,
      description: project.description,
    });
  }
}
