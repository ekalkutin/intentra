import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AccountId, WorkspaceId } from '@intentra/shared';

import { WorkspaceRepository } from '../../application/ports/index.js';
import { Workspace } from '../../domain/entities/index.js';
import {
  WorkspaceAlias,
  WorkspaceName,
} from '../../domain/value-objects/index.js';
import { WorkspaceModel } from '../database/index.js';

@Injectable()
export class WorkspaceRepositoryAdapter extends WorkspaceRepository {
  constructor(
    @InjectModel(WorkspaceModel.name)
    private readonly workspaceModel: Model<WorkspaceModel>,
  ) {
    super();
  }

  public async save(workspace: Workspace): Promise<void> {
    await this.workspaceModel
      .replaceOne(
        { _id: workspace.id.value },
        {
          name: workspace.name.value,
          alias: workspace.alias.value,
          members: workspace.members.map(member => member.value),
        },
        { upsert: true },
      )
      .exec();
  }

  public async findByMember(
    member: AccountId,
    ids?: WorkspaceId[],
  ): Promise<Workspace[]> {
    const filter = {
      members: member.value,
      ...(ids && { _id: { $in: ids.map(id => id.value) } }),
    };
    const workspaces = await this.workspaceModel.find(filter).exec();
    return workspaces.map(workspace => this.toDomain(workspace));
  }

  public async findById(id: WorkspaceId): Promise<Workspace | null> {
    const workspace = await this.workspaceModel.findById(id.value).exec();
    return workspace ? this.toDomain(workspace) : null;
  }

  public async findByAlias(alias: WorkspaceAlias): Promise<Workspace | null> {
    const workspace = await this.workspaceModel
      .findOne({ alias: alias.value })
      .exec();
    return workspace ? this.toDomain(workspace) : null;
  }

  private toDomain(workspace: WorkspaceModel): Workspace {
    return Workspace.reconstitute(new WorkspaceId(workspace._id), {
      name: new WorkspaceName(workspace.name),
      alias: new WorkspaceAlias(workspace.alias),
      members: workspace.members.map(member => new AccountId(member)),
    });
  }
}
