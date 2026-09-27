import { Field, Int, ObjectType } from '@nestjs/graphql';

import type { AgentToolDto, ModelDto } from '@intentra/contracts/agents';

@ObjectType('Model')
export class ModelType implements ModelDto {
  @Field()
  public readonly id: string;

  @Field()
  public readonly name: string;

  @Field(() => Int, { nullable: true })
  public readonly contextLength: number | null;
}

@ObjectType('AgentTool')
export class AgentToolType implements AgentToolDto {
  @Field()
  public readonly id: string;

  @Field()
  public readonly description: string;
}
