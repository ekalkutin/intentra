import { Injectable } from '@nestjs/common';

import type { AuthApi, RegisterAccountDto } from '@intentra/contracts/iam';

import { Account } from '../../domain/entities/index.js';
import { AccountRepository, PasswordHasher } from '../ports/outbound/index.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async register(data: RegisterAccountDto): Promise<void> {
    const accountExists = await this.accountRepository.existsByEmail(
      data.email,
    );
    if (accountExists) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(data.password);
    const account = Account.register({ email: data.email, passwordHash });

    await this.accountRepository.save(account);
  }
}
