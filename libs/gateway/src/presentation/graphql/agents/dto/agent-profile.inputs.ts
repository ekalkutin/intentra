import { Field, InputType } from '@nestjs/graphql';

import type {
  CreateAgentProfileDto,
  UpdateAgentProfileDto,
} from '@intentra/contracts/agents';

@InputType('ModelRefInput')
export class ModelRefInput {
  @Field()
  public readonly provider: string;

  @Field()
  public readonly name: string;
}

@InputType('CreateAgentProfileInput')
export class CreateAgentProfileInput implements CreateAgentProfileDto {
  @Field()
  public readonly name: string;

  @Field()
  public readonly instructions: string;

  @Field(() => ModelRefInput)
  public readonly model: ModelRefInput;

  @Field(() => [String], { nullable: true })
  public readonly tools?: string[];
}

/** Only the fields that change; `tools` replaces the whole list. */
@InputType('UpdateAgentProfileInput')
export class UpdateAgentProfileInput implements UpdateAgentProfileDto {
  @Field(() => String, { nullable: true })
  public readonly name?: string;

  @Field(() => String, { nullable: true })
  public readonly instructions?: string;

  @Field(() => ModelRefInput, { nullable: true })
  public readonly model?: ModelRefInput;

  @Field(() => [String], { nullable: true })
  public readonly tools?: string[];
}
