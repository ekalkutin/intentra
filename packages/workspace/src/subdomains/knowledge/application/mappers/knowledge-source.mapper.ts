import {
  AgentKindDtoSchema,
  type CallerDto,
} from '@intentra/contracts/workspace';

import { KnowledgeSource } from '../../domain/value-objects/index.js';

/** Where what the caller records comes from: their own hand, or the agent working for them. */
export function toKnowledgeSource(caller: CallerDto): KnowledgeSource {
  switch (caller.agent?.kind) {
    case undefined:
      return KnowledgeSource.Manual;
    case AgentKindDtoSchema.enum.external:
      return KnowledgeSource.ExternalAgent;
    case AgentKindDtoSchema.enum.intentra:
      return KnowledgeSource.IntentraAgent;
  }
}
