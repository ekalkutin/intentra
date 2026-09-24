import { Inject, Injectable } from '@nestjs/common';

import type { AuthApi, SignUpDto, TokensDto } from '@intentra/iam-contracts';

import { Account } from '../../domain/entities/index.js';
import { AccountRepository } from '../ports/index.js';

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
