import { Field, InputType, Int } from '@nestjs/graphql';

import type { CreatePersonalAccessTokenDto } from '@intentra/contracts/iam';

@InputType('CreatePersonalAccessTokenInput')
export class CreatePersonalAccessTokenInput implements CreatePersonalAccessTokenDto {
  @Field()
  public readonly name: string;

  /** Omitted: never expires. */
  @Field(() => Int, { nullable: true })
  public readonly expiresInDays?: number;
}
