import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { AgentProfileDto } from '@intentra/contracts/agents';

@ObjectType('ModelRef')
export class ModelRefType {
  @Field()
  public readonly provider: string;

  @Field()
  public readonly name: string;
}

@ObjectType('AgentProfile')
export class AgentProfileType implements AgentProfileDto {
  @Field(() => ID)
  public readonly id: string;

  @Field(() => ID)
  public readonly workspaceId: string;

  @Field()
  public readonly name: string;

  @Field()
  public readonly instructions: string;

  @Field(() => ModelRefType)
  public readonly model: ModelRefType;

  @Field(() => [String])
  public readonly tools: string[];
}
