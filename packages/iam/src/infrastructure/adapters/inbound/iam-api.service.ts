import { Inject, Injectable } from '@nestjs/common';

import type { IamApi } from '@intentra/contracts/iam';

import {
  AccountsService,
  AuthService,
  SignUpService,
} from '../../../application/services/index.js';

@Injectable()
export class IamApiService implements IamApi {
  constructor(
    @Inject(AccountsService)
    public readonly accounts: AccountsService,
    @Inject(AuthService)
    public readonly auth: AuthService,
    @Inject(SignUpService)
    public readonly signUp: SignUpService,
  ) {}
}
