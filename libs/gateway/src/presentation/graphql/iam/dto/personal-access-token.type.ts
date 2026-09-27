import { Field, ID, ObjectType } from '@nestjs/graphql';

import type {
  CreatedPersonalAccessTokenDto,
  PersonalAccessTokenDto,
} from '@intentra/contracts/iam';

@ObjectType('PersonalAccessToken')
export class PersonalAccessTokenType implements PersonalAccessTokenDto {
  @Field(() => ID)
  public readonly id: string;

  @Field()
  public readonly name: string;

  @Field()
  public readonly createdAt: string;

  /** `null`: never expires. */
  @Field(() => String, { nullable: true })
  public readonly expiresAt: string | null;

  @Field(() => String, { nullable: true })
  public readonly revokedAt: string | null;
}

/** The secret is shown only here, once. */
@ObjectType('CreatedPersonalAccessToken')
export class CreatedPersonalAccessTokenType implements CreatedPersonalAccessTokenDto {
  @Field()
  public readonly token: string;

  @Field(() => PersonalAccessTokenType)
  public readonly personalAccessToken: PersonalAccessTokenType;
}
