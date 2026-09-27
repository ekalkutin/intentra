import { Field, InputType } from '@nestjs/graphql';

import type { ChangePasswordDto } from '@intentra/contracts/iam';

@InputType('ChangePasswordInput')
export class ChangePasswordInput implements ChangePasswordDto {
  @Field()
  public readonly currentPassword: string;

  @Field()
  public readonly newPassword: string;
}
