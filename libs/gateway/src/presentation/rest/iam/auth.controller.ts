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
import { WorkspaceApi } from '@intentra/contracts/workspace';

@Controller('iam/auth')
export class AuthController {
  constructor(
    @Inject(IamApi) private readonly iam: IamApi,
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
  ) {}

  /**
   * IAM never reads Invitations: while Open Sign-up is off, Workspace is
   * asked whether the email was invited, and IAM gets only the answer.
   */
  @Post('sign-up')
  public async signUp(
    @Body({ schema: RegisterAccountDtoSchema }) data: RegisterAccountDto,
  ): Promise<void> {
    const invited = await this.workspace.invitations.hasPending(data.email);
    await this.iam.auth.register(data, { invited });
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
