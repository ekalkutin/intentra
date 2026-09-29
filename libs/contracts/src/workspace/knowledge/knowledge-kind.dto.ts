import { z } from 'zod';

export const KnowledgeKindDtoSchema = z.enum([
  'term',
  'requirement',
  'decision',
]);

export type KnowledgeKindDto = z.infer<typeof KnowledgeKindDtoSchema>;

export const KnowledgeStatusDtoSchema = z.enum([
  'draft',
  'approved',
  'rejected',
]);

export type KnowledgeStatusDto = z.infer<typeof KnowledgeStatusDtoSchema>;

/** Where a Knowledge Item came from: entered by hand, or recorded by an external agent over MCP. */
export const KnowledgeSourceDtoSchema = z.enum(['manual', 'external-agent']);

export type KnowledgeSourceDto = z.infer<typeof KnowledgeSourceDtoSchema>;
