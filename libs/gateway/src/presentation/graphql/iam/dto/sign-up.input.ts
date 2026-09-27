import { Field, InputType } from '@nestjs/graphql';

import type { SignUpDto } from '@intentra/contracts/iam';

@InputType('SignUpInput')
export class SignUpInput implements SignUpDto {
  @Field()
  public readonly email: string;

  @Field()
  public readonly password: string;
}
