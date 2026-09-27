import { Inject, Injectable, Scope } from '@nestjs/common';

import { IamApi, type AccountDto } from '@intentra/contracts/iam';

import { EntityLoader } from '../loaders/index.js';

/** Callers decide who may see an account; this only batches the reads. */
@Injectable({ scope: Scope.REQUEST })
export class AccountLoader extends EntityLoader<AccountDto> {
  constructor(@Inject(IamApi) iam: IamApi) {
    super(ids => iam.accounts.find({ ids: [...ids] }));
  }
}
