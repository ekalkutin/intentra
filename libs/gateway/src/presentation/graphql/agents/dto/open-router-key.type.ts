import { Field, InputType, ObjectType } from '@nestjs/graphql';

import type {
  OpenRouterKeyDto,
  SetOpenRouterKeyDto,
} from '@intentra/contracts/agents';

/** What is shown of a stored key: never the key itself. */
@ObjectType('OpenRouterKey')
export class OpenRouterKeyType implements OpenRouterKeyDto {
  @Field()
  public readonly hint: string;

  @Field()
  public readonly updatedAt: string;
}

@InputType('SetOpenRouterKeyInput')
export class SetOpenRouterKeyInput implements SetOpenRouterKeyDto {
  @Field()
  public readonly apiKey: string;
}
