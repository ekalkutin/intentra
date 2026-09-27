import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { AccountDto } from '@intentra/contracts/iam';

@ObjectType('Account')
export class AccountType implements AccountDto {
  @Field(() => ID)
  public readonly id: string;

  @Field()
  public readonly email: string;

  /** `null`: not set yet; show the email instead. */
  @Field(() => String, { nullable: true })
  public readonly displayName: string | null;
}
