import { Body, Controller, Inject, Post } from '@nestjs/common';

import {
  IamApi,
  RegisterAccountDtoSchema,
  type RegisterAccountDto,
} from '@intentra/contracts/iam';

@Controller('iam/auth')
export class AuthController {
  constructor(@Inject(IamApi) private readonly iam: IamApi) {}

  @Post('sign-up')
  async signUp(
    @Body({ schema: RegisterAccountDtoSchema }) data: RegisterAccountDto,
  ): Promise<void> {
    await this.iam.auth.register(data);
  }
}
