import { Inject, Injectable } from '@nestjs/common';

import type { IamApi } from '@intentra/contracts/iam';

import { AccountsService, AuthService } from './accounts/index.js';

/** Local binding of `IamApi`: groups the services under one token. */
@Injectable()
export class IamApiService implements IamApi {
  constructor(
    @Inject(AccountsService)
    public readonly accounts: AccountsService,

    @Inject(AuthService)
    public readonly auth: AuthService,
  ) {}
}
