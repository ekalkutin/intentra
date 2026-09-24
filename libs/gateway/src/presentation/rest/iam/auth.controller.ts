import { Body, Controller, Inject, Post } from '@nestjs/common';

import {
  IamApi,
  SignUpDtoSchema,
  TokensDto,
  type SignUpDto,
} from '@intentra/iam-contracts';

@Controller({
  path: 'iam/auth',
})
export class AuthController {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  @Post('/sign-up')
  public signUp(
    @Body({ schema: SignUpDtoSchema }) signUpDto: SignUpDto,
  ): Promise<TokensDto> {
    return this.iam.auth.signUp(signUpDto);
  }
}
