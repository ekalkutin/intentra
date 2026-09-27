import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceId } from '@intentra/shared';

import { WorkspaceRepository } from '../../application/ports/workspace-repository.port.js';
import { Workspace } from '../../domain/entities/workspace.aggregate.js';
import { WorkspaceDatabase } from '../database/workspace-database.js';

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
