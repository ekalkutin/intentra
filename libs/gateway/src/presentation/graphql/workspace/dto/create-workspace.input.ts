import { Field, InputType } from '@nestjs/graphql';

import type { CreateWorkspaceDto } from '@intentra/contracts/workspace';

@InputType('CreateWorkspaceInput')
export class CreateWorkspaceInput implements CreateWorkspaceDto {
  @Field()
  public readonly name: string;

  @Field()
  public readonly alias: string;
}
