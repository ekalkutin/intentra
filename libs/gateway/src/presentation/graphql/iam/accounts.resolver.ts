import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  ChangePasswordDtoSchema,
  IamApi,
  UpdateAccountDtoSchema,
  type AccountDto,
  type ChangePasswordDto,
  type UpdateAccountDto,
} from '@intentra/contracts/iam';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';
import { SchemaPipe } from '../schema.pipe.js';

import {
  AccountType,
  ChangePasswordInput,
  UpdateAccountInput,
} from './dto/index.js';

@Resolver()
export class AccountsResolver {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  /** The signed-in account, already read by the guard. */
  @Query(() => AccountType, { name: 'me' })
  public me(@CurrentAccount() account: AuthenticatedAccount): AccountDto {
    return {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
    };
  }

  @Mutation(() => AccountType, { name: 'updateAccount' })
  public updateAccount(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args(
      'input',
      { type: () => UpdateAccountInput },
      new SchemaPipe(UpdateAccountDtoSchema),
    )
    input: UpdateAccountDto,
  ): Promise<AccountDto> {
    return this.iam.accounts.update(account.id, input);
  }

  @Mutation(() => Boolean, { name: 'changePassword' })
  public async changePassword(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args(
      'input',
      { type: () => ChangePasswordInput },
      new SchemaPipe(ChangePasswordDtoSchema),
    )
    input: ChangePasswordDto,
  ): Promise<boolean> {
    await this.iam.accounts.changePassword(account.id, input);
    return true;
  }
}
