import { Injectable } from '@nestjs/common';

import { PrismaUnitOfWork } from '../../../../infrastructure/persistence/prisma/prisma-unit-of-work.js';
import { type PrismaTransaction } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { Project } from '../../domain/entities/index.js';
import { ProjectRepository } from '../../domain/repositories/index.js';

type ProjectRow = {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: Date;
};

@Injectable()
export class ProjectRepositoryAdapter extends ProjectRepository {
  constructor(private readonly unitOfWork: PrismaUnitOfWork) {
    super();
  }

  private get client(): PrismaTransaction {
    return this.unitOfWork.client;
  }

  public async save(project: Project): Promise<void> {
    const row = { name: project.name };

    await this.client.project.upsert({
      where: { id: project.id.toString() },
      create: {
        id: project.id.toString(),
        workspaceId: project.workspaceId.toString(),
        createdAt: project.createdAt,
        ...row,
      },
      update: row,
    });

    await this.unitOfWork.announce(project.pullEvents());
  }

  public async findById(id: string): Promise<Project | null> {
    const row = await this.client.project.findUnique({ where: { id } });

    return row === null ? null : this.reconstitute(row);
  }

  public async findManyInWorkspace(
    workspaceId: string,
    onlyIds?: readonly string[],
  ): Promise<Project[]> {
    const rows = await this.client.project.findMany({
      where: {
        workspaceId,
        // `undefined` — «не сужать»; пустой список — «нечего показывать», и это
        // разные вещи: у участника без выданных проектов список пуст.
        ...(onlyIds === undefined ? {} : { id: { in: [...onlyIds] } }),
      },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(row => this.reconstitute(row));
  }

  private reconstitute(row: ProjectRow): Project {
    return Project.reconstitute({
      id: row.id,
      workspaceId: row.workspaceId,
      name: row.name,
      createdAt: row.createdAt,
    });
  }
}
