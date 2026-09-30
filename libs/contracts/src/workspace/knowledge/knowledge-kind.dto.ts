import { z } from 'zod';

export const KnowledgeKindDtoSchema = z.enum([
  'product-overview',
  'goal',
  'persona',
  'scenario',
  'requirement',
  'constraint',
  'term',
  'business-rule',
  'integration',
  'decision',
  'open-question',
]);

export type KnowledgeKindDto = z.infer<typeof KnowledgeKindDtoSchema>;

export const KnowledgeStatusDtoSchema = z.enum([
  'draft',
  'approved',
  'rejected',
  'obsolete',
]);

export type KnowledgeStatusDto = z.infer<typeof KnowledgeStatusDtoSchema>;

/** Where a Knowledge Item came from: entered by hand, recorded by an external agent over MCP, or by one of Intentra's own Agents in a Conversation. */
export const KnowledgeSourceDtoSchema = z.enum([
  'manual',
  'external-agent',
  'intentra-agent',
]);

export type KnowledgeSourceDto = z.infer<typeof KnowledgeSourceDtoSchema>;
