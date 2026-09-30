import { z } from 'zod';

import { KNOWLEDGE_FIELDS_DTO_SCHEMAS } from './knowledge-fields.dto.js';
import { KnowledgeLinkDtoSchema } from './knowledge-link.dto.js';

const frame = {
  title: z.string(),
  /** What the Knowledge Item rests on; optional only when entered by hand. */
  rationale: z.string().nullable().default(null),
  /**
   * The Knowledge Key of the Approved item of the same Kind this one replaces;
   * approving it is then a Supersession.
   */
  supersedes: z.string().nullable().default(null),
  /** To Approved or Draft items only; a `depends-on` Draft target must be approved together. */
  links: z.array(KnowledgeLinkDtoSchema).default([]),
};

function recording<K extends keyof typeof KNOWLEDGE_FIELDS_DTO_SCHEMAS>(
  kind: K,
) {
  return z.object({
    kind: z.literal(kind),
    ...frame,
    fields: KNOWLEDGE_FIELDS_DTO_SCHEMAS[kind],
  });
}

export const RecordKnowledgeItemDtoSchema = z.discriminatedUnion('kind', [
  recording('product-overview'),
  recording('goal'),
  recording('persona'),
  recording('scenario'),
  recording('requirement'),
  recording('constraint'),
  recording('term'),
  recording('business-rule'),
  recording('integration'),
  recording('decision'),
  recording('open-question'),
]);

export type RecordKnowledgeItemDto = z.infer<
  typeof RecordKnowledgeItemDtoSchema
>;
