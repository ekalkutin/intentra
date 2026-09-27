import { Inject, Injectable } from '@nestjs/common';

import type { AuthApi, SignUpDto, TokensDto } from '@intentra/contracts/iam';

import { Account } from '../domain/account.aggregate.js';

import { AccountRepository } from './account-repository.port.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async signUp(data: SignUpDto): Promise<TokensDto> {
    const account = Account.signUp(data.email, data.password);

    await this.accountRepository.save(account);

    return {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
    };
  }
}
