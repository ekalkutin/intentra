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
  RefreshTokensDtoSchema,
  RegisterAccountDtoSchema,
  SignInDtoSchema,
  type RefreshTokensDto,
  type RegisterAccountDto,
  type SignInDto,
  type TokenPair,
} from '@intentra/contracts/iam';

@Controller('iam/auth')
export class AuthController {
  constructor(@Inject(IamApi) private readonly iam: IamApi) {}

  @Post('sign-up')
  public async signUp(
    @Body({ schema: RegisterAccountDtoSchema }) data: RegisterAccountDto,
  ): Promise<void> {
    await this.iam.auth.register(data);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  public async signIn(
    @Body({ schema: SignInDtoSchema }) data: SignInDto,
  ): Promise<TokenPair> {
    return this.iam.auth.signIn(data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Body({ schema: RefreshTokensDtoSchema }) data: RefreshTokensDto,
  ): Promise<TokenPair> {
    return this.iam.auth.refresh(data);
  }
}
