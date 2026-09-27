import { Field, InputType } from '@nestjs/graphql';

import type { UpdateWorkspaceDto } from '@intentra/contracts/workspace';

@InputType('UpdateWorkspaceInput')
export class UpdateWorkspaceInput implements UpdateWorkspaceDto {
  @Field()
  public readonly name: string;
}
