import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { Account } from '../../domain/entities/index.js';
import { AccountRepository } from '../../domain/repositories/index.js';

import { PrismaService } from './prisma/prisma.service.js';

type AccountRow = {
  id: string;
  email: string;
  passwordHash: string;
};

@Injectable()
export class AccountRepositoryAdapter extends AccountRepository {
  constructor(
    private readonly database: PrismaService,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  public async save(account: Account): Promise<void> {
    const row = {
      email: account.email,
      passwordHash: account.passwordHash,
    };

    await this.database.account.upsert({
      where: { id: account.id.toString() },
      create: { id: account.id.toString(), ...row },
      update: row,
    });

    for (const event of account.pullEvents()) {
      await this.eventBus.publish(event);
    }
  }

  public async getById(id: string): Promise<Account> {
    return this.reconstitute(
      await this.database.account.findUniqueOrThrow({ where: { id } }),
    );
  }

  public async findByEmail(email: string): Promise<Account | null> {
    const row = await this.database.account.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    return row === null ? null : this.reconstitute(row);
  }

  private reconstitute(row: AccountRow): Account {
    return Account.reconstitute({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
    });
  }
}
