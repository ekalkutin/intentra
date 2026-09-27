import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { WorkspaceDto } from '@intentra/contracts/workspace';

@ObjectType('Workspace')
export class WorkspaceType implements WorkspaceDto {
  @Field(() => ID)
  public readonly id: string;

  @Field()
  public readonly name: string;
}
