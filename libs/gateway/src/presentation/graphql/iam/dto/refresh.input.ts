import { Field, InputType } from '@nestjs/graphql';

import type { RefreshDto } from '@intentra/contracts/iam';

@InputType('RefreshInput')
export class RefreshInput implements RefreshDto {
  @Field()
  public readonly refreshToken: string;
}
