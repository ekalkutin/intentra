import { Injectable } from '@nestjs/common';

import type { AccountsApi, CreateAccountDto } from '@intentra/contracts/iam';

import { AuthService } from './auth.service.js';

@Injectable()
export class AccountsService implements AccountsApi {
  constructor(private readonly auth: AuthService) {}

  public create(data: CreateAccountDto): Promise<void> {
    return this.auth.register(data);
  }
}
