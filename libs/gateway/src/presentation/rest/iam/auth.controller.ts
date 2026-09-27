import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';

import {
  IamApi,
  RefreshDtoSchema,
  SignInDtoSchema,
  SignUpDtoSchema,
  TokensDto,
  type RefreshDto,
  type SignInDto,
  type SignUpDto,
} from '@intentra/contracts/iam';

import { Public } from '../../auth/index.js';

@Public()
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

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  public signIn(
    @Body({ schema: SignInDtoSchema }) signInDto: SignInDto,
  ): Promise<TokensDto> {
    return this.iam.auth.signIn(signInDto);
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  public refresh(
    @Body({ schema: RefreshDtoSchema }) refreshDto: RefreshDto,
  ): Promise<TokensDto> {
    return this.iam.auth.refresh(refreshDto);
  }
}
