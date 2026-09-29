import { z } from 'zod';

export const KnowledgeKindDtoSchema = z.enum([
  'term',
  'requirement',
  'decision',
]);

export type KnowledgeKindDto = z.infer<typeof KnowledgeKindDtoSchema>;

export const KnowledgeStatusDtoSchema = z.enum(['draft']);

export type KnowledgeStatusDto = z.infer<typeof KnowledgeStatusDtoSchema>;

/** Where a Knowledge Item came from; for now only entered by hand. */
export type KnowledgeSourceDto = 'manual';
