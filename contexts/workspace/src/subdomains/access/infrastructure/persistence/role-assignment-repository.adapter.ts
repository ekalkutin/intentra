import { Injectable } from '@nestjs/common';

import { type ScopeType } from '@intentra/shared';

import { PrismaUnitOfWork } from '../../../../infrastructure/persistence/prisma/prisma-unit-of-work.js';
import { type PrismaTransaction } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { RoleAssignment } from '../../domain/entities/index.js';
import { RoleAssignmentRepository } from '../../domain/repositories/index.js';
import { type Role } from '../../domain/value-objects/index.js';

type RoleAssignmentRow = {
  id: string;
  workspaceId: string;
  accountId: string;
  role: string;
  scopeType: string;
  scopeId: string | null;
};

@Injectable()
export class RoleAssignmentRepositoryAdapter extends RoleAssignmentRepository {
  constructor(private readonly unitOfWork: PrismaUnitOfWork) {
    super();
  }

  private get client(): PrismaTransaction {
    return this.unitOfWork.client;
  }

  public async save(assignment: RoleAssignment): Promise<void> {
    await this.client.roleAssignment.upsert({
      where: { id: assignment.id.toString() },
      create: {
        id: assignment.id.toString(),
        workspaceId: assignment.workspaceId.toString(),
        accountId: assignment.accountId.toString(),
        role: assignment.role,
        scopeType: assignment.scope.type,
        scopeId: assignment.scope.id,
      },
      update: {},
    });

    await this.unitOfWork.announce(assignment.pullEvents());
  }

  public async findMany(
    workspaceId: string,
    accountId: string,
  ): Promise<RoleAssignment[]> {
    const rows = await this.client.roleAssignment.findMany({
      where: { workspaceId, accountId },
    });

    return rows.map(row => this.reconstitute(row));
  }

  /**
   * Код роли и тип области приходят из базы строками. Сузить их до типов домена
   * здесь — единственное место, где это честно: дальше по коду они уже обязаны
   * быть своими.
   */
  private reconstitute(row: RoleAssignmentRow): RoleAssignment {
    return RoleAssignment.reconstitute({
      id: row.id,
      workspaceId: row.workspaceId,
      accountId: row.accountId,
      role: row.role as Role,
      scopeType: row.scopeType as ScopeType,
      scopeId: row.scopeId,
    });
  }
}
