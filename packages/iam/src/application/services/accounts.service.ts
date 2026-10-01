import { Injectable } from '@nestjs/common';

import type {
  AccountDto,
  AccountsApi,
  Actor,
  EditMeDto,
  MeDto,
} from '@intentra/contracts/iam';
import {
  AccountId,
  Email,
  NotPlatformAdminException,
  PersonName,
  UnitOfWork,
} from '@intentra/shared-kernel';

import { Account } from '../../domain/entities/index.js';
import type { PlatformAdminCredentials } from '../../iam.module-defs.js';
import { AccountRepository, PasswordHasher } from '../ports/outbound/index.js';

@Injectable()
export class AccountsService implements AccountsApi {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accountRepository: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async getMe(actor: Actor): Promise<MeDto> {
    const account = await this.accountRepository.getOne({
      id: new AccountId(actor.accountId),
    });

    return { ...actor, name: account.name.value };
  }

  public async editMe(actor: Actor, data: EditMeDto): Promise<MeDto> {
    const name = new PersonName(data.name);

    return this.unitOfWork.run(async () => {
      const account = await this.accountRepository.getOne({
        id: new AccountId(actor.accountId),
      });
      account.rename(name);
      await this.accountRepository.save(account);

      return { ...actor, name: account.name.value };
    });
  }

  public async list(actor: Actor): Promise<AccountDto[]> {
    ensurePlatformAdmin(actor);
    const accounts = await this.accountRepository.findMany({});

    return accounts.map(account => ({
      id: account.id.value,
      email: account.email.value,
      name: account.name.value,
      isPlatformAdmin: account.isPlatformAdmin,
      isBlocked: account.isBlocked,
    }));
  }

  public async block(actor: Actor, accountId: string): Promise<void> {
    ensurePlatformAdmin(actor);
    const id = new AccountId(accountId);

    await this.unitOfWork.run(async () => {
      const account = await this.accountRepository.getOne({ id });
      account.block();
      await this.accountRepository.save(account);
    });
  }

  public async unblock(actor: Actor, accountId: string): Promise<void> {
    ensurePlatformAdmin(actor);
    const id = new AccountId(accountId);

    await this.unitOfWork.run(async () => {
      const account = await this.accountRepository.getOne({ id });
      account.unblock();
      await this.accountRepository.save(account);
    });
  }

  /**
   * Makes the Account with this email the only Platform Admin, creating it
   * with this password if there is none; with null, nobody is one. Only the
   * server's configuration appoints Platform Admins, never anything inside
   * the app.
   */
  public async syncPlatformAdmin(
    credentials: PlatformAdminCredentials | null,
  ): Promise<void> {
    const email = credentials && new Email(credentials.email);
    const passwordHash =
      credentials && (await this.passwordHasher.hash(credentials.password));

    await this.unitOfWork.run(async () => {
      const admins = await this.accountRepository.findMany({
        isPlatformAdmin: true,
      });
      for (const admin of admins) {
        if (!email || !admin.email.equals(email)) {
          admin.dismissPlatformAdmin();
          await this.accountRepository.save(admin);
        }
      }
      if (!email || !passwordHash) {
        return;
      }
      const account =
        (await this.accountRepository.findOne({ email })) ??
        Account.register({
          email: email.value,
          name: credentials.name,
          passwordHash,
        });
      account.appointPlatformAdmin();
      await this.accountRepository.save(account);
    });
  }
}

function ensurePlatformAdmin(actor: Actor): void {
  if (!actor.isPlatformAdmin) {
    throw new NotPlatformAdminException();
  }
}
