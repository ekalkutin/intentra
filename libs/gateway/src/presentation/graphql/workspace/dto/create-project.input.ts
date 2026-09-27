import { Field, ID, InputType } from '@nestjs/graphql';

import type { CreateProjectDto } from '@intentra/contracts/workspace';

@InputType('CreateProjectInput')
export class CreateProjectInput implements CreateProjectDto {
  @Field(() => ID)
  public readonly workspaceId: string;

  @Field()
  public readonly name: string;

  @Field(() => String, { nullable: true })
  public readonly description?: string;
}
