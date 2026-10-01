import { Injectable } from '@nestjs/common';

import type { AccountsApi } from '@intentra/contracts/iam';
import { Email, UnitOfWork } from '@intentra/shared-kernel';

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
        Account.register({ email: email.value, passwordHash });
      account.appointPlatformAdmin();
      await this.accountRepository.save(account);
    });
  }
}
