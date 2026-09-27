import { Field, ObjectType } from '@nestjs/graphql';

import type { TokensDto } from '@intentra/contracts/iam';

@ObjectType('Tokens')
export class TokensType implements TokensDto {
  @Field()
  public readonly accessToken: string;

  @Field()
  public readonly refreshToken: string;
}
