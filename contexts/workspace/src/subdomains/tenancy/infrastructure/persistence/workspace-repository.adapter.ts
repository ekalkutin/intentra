import { Injectable } from '@nestjs/common';

import { PrismaUnitOfWork } from '../../../../infrastructure/persistence/prisma/prisma-unit-of-work.js';
import { type PrismaTransaction } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { Workspace } from '../../domain/entities/index.js';
import { WorkspaceRepository } from '../../domain/repositories/index.js';

type WorkspaceRow = {
  id: string;
  name: string;
  createdAt: Date;
};

@Injectable()
export class WorkspaceRepositoryAdapter extends WorkspaceRepository {
  constructor(private readonly unitOfWork: PrismaUnitOfWork) {
    super();
  }

  /** Клиент открытой единицы работы, если она есть, иначе клиент сам по себе. */
  private get client(): PrismaTransaction {
    return this.unitOfWork.client;
  }

  public async save(workspace: Workspace): Promise<void> {
    const row = { name: workspace.name };

    await this.client.workspace.upsert({
      where: { id: workspace.id.toString() },
      create: {
        id: workspace.id.toString(),
        createdAt: workspace.createdAt,
        ...row,
      },
      update: row,
    });

    await this.unitOfWork.announce(workspace.pullEvents());
  }

  public async getById(id: string): Promise<Workspace> {
    return this.reconstitute(
      await this.client.workspace.findUniqueOrThrow({ where: { id } }),
    );
  }

  public async findById(id: string): Promise<Workspace | null> {
    const row = await this.client.workspace.findUnique({ where: { id } });

    return row === null ? null : this.reconstitute(row);
  }

  public async findByMember(accountId: string): Promise<Workspace[]> {
    const rows = await this.client.workspace.findMany({
      where: { memberships: { some: { accountId } } },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(row => this.reconstitute(row));
  }

  private reconstitute(row: WorkspaceRow): Workspace {
    return Workspace.reconstitute({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    });
  }
}
