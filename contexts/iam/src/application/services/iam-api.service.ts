import { Inject, Injectable } from '@nestjs/common';

import { IamApi } from '@intentra/iam-contracts';

import { AccountsService } from './accounts.service.js';
import { AuthService } from './auth.service.js';

/** Local binding of `IamApi`: groups the services under one token. */
@Injectable()
export class IamApiService extends IamApi {
  constructor(
    @Inject(AccountsService)
    public readonly accounts: AccountsService,

    @Inject(AuthService)
    public readonly auth: AuthService,
  ) {
    super();
  }
}
