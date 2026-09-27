import { Query, Resolver } from '@nestjs/graphql';

import type { AccountDto } from '@intentra/contracts/iam';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';

import { AccountType } from './dto/index.js';

@Resolver()
export class AccountsResolver {
  /** The signed-in account, already read by the guard. */
  @Query(() => AccountType, { name: 'me' })
  public me(@CurrentAccount() account: AuthenticatedAccount): AccountDto {
    return { id: account.id, email: account.email };
  }
}
