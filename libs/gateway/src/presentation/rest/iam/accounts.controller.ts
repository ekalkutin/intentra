import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ChangePasswordDtoSchema,
  IamApi,
  UpdateAccountDtoSchema,
  type AccountDto,
  type ChangePasswordDto,
  type UpdateAccountDto,
} from '@intentra/contracts/iam';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';

@Controller({
  path: 'iam/accounts',
})
export class AccountsController {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  /** Already read by the guard: no second trip to IAM. */
  @Get('/me')
  public me(@CurrentAccount() account: AuthenticatedAccount): AccountDto {
    return {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
    };
  }

  @Patch('/me')
  public update(
    @CurrentAccount() account: AuthenticatedAccount,
    @Body({ schema: UpdateAccountDtoSchema }) data: UpdateAccountDto,
  ): Promise<AccountDto> {
    return this.iam.accounts.update(account.id, data);
  }

  @Post('/me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public changePassword(
    @CurrentAccount() account: AuthenticatedAccount,
    @Body({ schema: ChangePasswordDtoSchema }) data: ChangePasswordDto,
  ): Promise<void> {
    return this.iam.accounts.changePassword(account.id, data);
  }
}
