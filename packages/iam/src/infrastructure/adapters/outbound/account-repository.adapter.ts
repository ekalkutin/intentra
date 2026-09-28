import { Injectable, Provider } from '@nestjs/common';

import { AccountRepository } from '../../../application/ports/outbound/account-repository.port.js';
import { Account } from '../../../domain/entities/account.js';

@Injectable()
export class AccountRepositoryAdapter implements AccountRepository {
  constructor() {}

  public async save(account: Account): Promise<void> {
    void account;
  }

  public async existsByEmail(email: string): Promise<boolean> {
    void email;
    return true;
  }
}

export const ACCOUNT_REPOSITORY_PROVIDER: Provider = {
  provide: AccountRepository,
  useClass: AccountRepositoryAdapter,
};
