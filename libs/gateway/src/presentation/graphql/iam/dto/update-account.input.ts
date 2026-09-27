import { Field, InputType } from '@nestjs/graphql';

import type { UpdateAccountDto } from '@intentra/contracts/iam';

@InputType('UpdateAccountInput')
export class UpdateAccountInput implements UpdateAccountDto {
  /** `null` or blank clears it. */
  @Field(() => String, { nullable: true })
  public readonly displayName: string | null;
}
