import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { WorkspaceDto } from '@intentra/contracts/workspace';

@ObjectType('Workspace')
export class WorkspaceType implements WorkspaceDto {
  @Field(() => ID)
  public readonly id: string;

  @Field()
  public readonly name: string;

  @Field()
  public readonly alias: string;

  /** Account ids; the creator comes first. */
  @Field(() => [ID])
  public readonly memberIds: string[];
}
