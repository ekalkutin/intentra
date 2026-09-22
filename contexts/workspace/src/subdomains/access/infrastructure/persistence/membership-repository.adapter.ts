import { Injectable } from '@nestjs/common';

import { PrismaUnitOfWork } from '../../../../infrastructure/persistence/prisma/prisma-unit-of-work.js';
import { type PrismaTransaction } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { Membership } from '../../domain/entities/index.js';
import { MembershipRepository } from '../../domain/repositories/index.js';

type MembershipRow = {
  id: string;
  workspaceId: string;
  accountId: string;
  joinedAt: Date;
};

@Injectable()
export class MembershipRepositoryAdapter extends MembershipRepository {
  constructor(private readonly unitOfWork: PrismaUnitOfWork) {
    super();
  }

  private get client(): PrismaTransaction {
    return this.unitOfWork.client;
  }

  public async save(membership: Membership): Promise<void> {
    await this.client.membership.upsert({
      where: { id: membership.id.toString() },
      create: {
        id: membership.id.toString(),
        workspaceId: membership.workspaceId.toString(),
        accountId: membership.accountId.toString(),
        joinedAt: membership.joinedAt,
      },
      update: {},
    });

    await this.unitOfWork.announce(membership.pullEvents());
  }

  public async findOne(
    workspaceId: string,
    accountId: string,
  ): Promise<Membership | null> {
    const row = await this.client.membership.findUnique({
      where: { workspaceId_accountId: { workspaceId, accountId } },
    });

    return row === null ? null : this.reconstitute(row);
  }

  private reconstitute(row: MembershipRow): Membership {
    return Membership.reconstitute({
      id: row.id,
      workspaceId: row.workspaceId,
      accountId: row.accountId,
      joinedAt: row.joinedAt,
    });
  }
}
