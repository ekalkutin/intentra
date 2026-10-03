import { z } from 'zod';

/**
 * `depends-on`: it holds only while the target holds; `uses-term`: it uses a
 * Term; `justified-by`: a Decision is the reason for it; `part-of`: a
 * Scenario, Requirement or Business Rule belongs to a Feature (one at most);
 * `answers`: it
 * settles an Open Question; `concerns`: an Open Question is about the target
 * (only an Open Question holds it); `conflicts-with`: the two contradict each
 * other.
 */
export const KnowledgeLinkTypeDtoSchema = z.enum([
  'depends-on',
  'uses-term',
  'justified-by',
  'part-of',
  'answers',
  'concerns',
  'conflicts-with',
]);

export type KnowledgeLinkTypeDto = z.infer<typeof KnowledgeLinkTypeDtoSchema>;

/** A directed connection from the Knowledge Item that holds it to another. */
export const KnowledgeLinkDtoSchema = z.object({
  type: KnowledgeLinkTypeDtoSchema,
  key: z.string().describe('The Knowledge Key of the target, such as REQ-12.'),
});

export type KnowledgeLinkDto = z.infer<typeof KnowledgeLinkDtoSchema>;
