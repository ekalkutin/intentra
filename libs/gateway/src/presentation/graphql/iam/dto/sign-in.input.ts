import { Field, InputType } from '@nestjs/graphql';

import type { SignInDto } from '@intentra/contracts/iam';

@InputType('SignInInput')
export class SignInInput implements SignInDto {
  @Field()
  public readonly email: string;

  @Field()
  public readonly password: string;
}
