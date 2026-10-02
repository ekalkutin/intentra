import {
  AgentKindDtoSchema,
  type CallerDto,
} from '@intentra/contracts/workspace';

import { KnowledgeSource } from '../../domain/value-objects/index.js';

/** Where what the caller records comes from: their own hand, the agent working for them, or Intentra itself in an Analysis Run. */
export function toKnowledgeSource(caller: CallerDto): KnowledgeSource {
  switch (caller.agent?.kind) {
    case undefined:
      return KnowledgeSource.Manual;
    case AgentKindDtoSchema.enum.external:
      return KnowledgeSource.ExternalAgent;
    case AgentKindDtoSchema.enum.intentra:
      return KnowledgeSource.IntentraAgent;
    case AgentKindDtoSchema.enum['analysis-run']:
      return KnowledgeSource.AnalysisRun;
  }
}
