import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';

import {
  CreatePersonalAccessTokenDtoSchema,
  IamApi,
  type CreatedPersonalAccessTokenDto,
  type CreatePersonalAccessTokenDto,
  type PersonalAccessTokenDto,
} from '@intentra/contracts/iam';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';

/** Managed by a signed-in person only: a token cannot make more tokens. */
@Controller({
  path: 'iam/personal-access-tokens',
})
export class PersonalAccessTokensController {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  @Get()
  public find(
    @CurrentAccount() account: AuthenticatedAccount,
  ): Promise<PersonalAccessTokenDto[]> {
    return this.iam.personalAccessTokens.find(account.id);
  }

  @Post()
  public create(
    @CurrentAccount() account: AuthenticatedAccount,
    @Body({ schema: CreatePersonalAccessTokenDtoSchema })
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto> {
    return this.iam.personalAccessTokens.create(account.id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public revoke(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('id') id: string,
  ): Promise<void> {
    return this.iam.personalAccessTokens.revoke(account.id, id);
  }
}
