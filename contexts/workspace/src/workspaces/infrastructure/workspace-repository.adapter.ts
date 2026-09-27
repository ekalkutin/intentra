import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceId } from '@intentra/shared';

import { WorkspaceDatabase } from '../../infrastructure/database/workspace-database.js';
import { WorkspaceRepository } from '../application/workspace-repository.port.js';
import { Workspace } from '../domain/workspace.aggregate.js';

type WorkspaceRow = {
  readonly id: string;
  readonly name: string;
};

@Injectable()
export class WorkspaceRepositoryAdapter extends WorkspaceRepository {
  constructor(
    @Inject(WorkspaceDatabase)
    private readonly database: WorkspaceDatabase,
  ) {
    super();
  }

  public async save(workspace: Workspace): Promise<void> {
    await this.database.orm.public.Workspace.create({
      id: workspace.id.value,
      name: workspace.name,
    });
  }

  public async find(): Promise<Workspace[]> {
    const workspaces = await this.database.orm.public.Workspace.all();
    return workspaces.map(workspace => this.toDomain(workspace));
  }

  public async findById(id: WorkspaceId): Promise<Workspace | null> {
    const workspace = await this.database.orm.public.Workspace.first({
      id: id.value,
    });
    return workspace ? this.toDomain(workspace) : null;
  }

  private toDomain(workspace: WorkspaceRow): Workspace {
    return Workspace.reconstitute(new WorkspaceId(workspace.id), {
      name: workspace.name,
    });
  }
}
