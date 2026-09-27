import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WorkspaceId } from '@intentra/shared';

import { WorkspaceRepository } from '../../application/ports/workspace-repository.port.js';
import { Workspace } from '../../domain/entities/workspace.aggregate.js';
import { WorkspaceModel } from '../database/workspace.schema.js';

@Injectable()
export class WorkspaceRepositoryAdapter extends WorkspaceRepository {
  constructor(
    @InjectModel(WorkspaceModel.name)
    private readonly workspaceModel: Model<WorkspaceModel>,
  ) {
    super();
  }

  public async save(workspace: Workspace): Promise<void> {
    const workspaceModel = new this.workspaceModel({
      _id: workspace.id.value,
      name: workspace.name,
    });
    await workspaceModel.save();
  }

  public async find(ids?: WorkspaceId[]): Promise<Workspace[]> {
    const filter = ids ? { _id: { $in: ids.map(id => id.value) } } : {};
    const workspaces = await this.workspaceModel.find(filter).exec();
    return workspaces.map(workspace => this.toDomain(workspace));
  }

  public async findById(id: WorkspaceId): Promise<Workspace | null> {
    const workspace = await this.workspaceModel.findById(id.value).exec();
    return workspace ? this.toDomain(workspace) : null;
  }

  private toDomain(workspace: WorkspaceModel): Workspace {
    return Workspace.reconstitute(new WorkspaceId(workspace._id), {
      name: workspace.name,
    });
  }
}
