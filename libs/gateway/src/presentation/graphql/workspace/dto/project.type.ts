import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { ProjectDto } from '@intentra/contracts/workspace';

@ObjectType('Project')
export class ProjectType implements ProjectDto {
  @Field(() => ID)
  public readonly id: string;

  @Field(() => ID)
  public readonly workspaceId: string;

  @Field()
  public readonly name: string;

  @Field(() => String, { nullable: true })
  public readonly description?: string;
}
