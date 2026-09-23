import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WorkspaceRepository } from '../../../application/ports/index.js';
import { Workspace } from '../../../domain/entities/index.js';
import { WorkspaceId } from '../../../domain/value-objects/index.js';

import { WorkspaceModel } from './workspace.schema.js';

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

  public async find(): Promise<Workspace[]> {
    const workspaces = await this.workspaceModel.find().exec();
    return workspaces.map(workspace =>
      Workspace.reconstitute(new WorkspaceId(workspace._id), {
        name: workspace.name,
      }),
    );
  }
}
