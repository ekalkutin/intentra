import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { AgentProfileDto, AgentRole } from '@intentra/contracts/agents';

@ObjectType('AgentProfile')
export class AgentProfileType implements AgentProfileDto {
  @Field(() => ID)
  public readonly id: string;

  @Field(() => ID)
  public readonly workspaceId: string;

  /** `orchestrator` or `specialist`. */
  @Field(() => String)
  public readonly role: AgentRole;

  @Field()
  public readonly name: string;

  @Field()
  public readonly description: string;

  @Field()
  public readonly instructions: string;

  /** An OpenRouter model id, such as `anthropic/claude-sonnet-4.5`. */
  @Field()
  public readonly model: string;

  @Field(() => [String])
  public readonly tools: string[];
}
