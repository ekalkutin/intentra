import { Inject, Injectable } from '@nestjs/common';

import { AuthApi, SignUpDto, TokensDto } from '@intentra/iam-contracts';

import { AccountRepository } from '../../application/ports/index.js';
import { Account } from '../../domain/entities/index.js';

@Injectable()
export class AuthApiAdapter extends AuthApi {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {
    super();
  }

  public async signUp(data: SignUpDto): Promise<TokensDto> {
    const acccount = Account.signUp(data.email, data.password);

    await this.accountRepository.save(acccount);

    return {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
    };
  }
}
