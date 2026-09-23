import { Body, Controller, Inject, Post } from '@nestjs/common';

import {
  AccountApi,
  AuthApi,
  SignUpDtoSchema,
  TokensDto,
  type SignUpDto,
} from '@intentra/iam-contracts';

@Controller({
  path: 'iam/auth',
})
export class AuthController {
  constructor(
    @Inject(AccountApi)
    private readonly accountApi: AccountApi,

    @Inject(AuthApi)
    private readonly authApi: AuthApi,
  ) {}

  @Post('/sign-up')
  public signUp(
    @Body({ schema: SignUpDtoSchema }) signUpDto: SignUpDto,
  ): Promise<TokensDto> {
    return this.authApi.signUp(signUpDto);
  }
}
