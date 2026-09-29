import { z } from 'zod';

import { KNOWLEDGE_FIELDS_DTO_SCHEMAS } from './knowledge-fields.dto.js';
import { KnowledgeLinkDtoSchema } from './knowledge-link.dto.js';

const frame = {
  /** The version the client last saw (409 `KNOWLEDGE_ITEM_CHANGED` if it is not the current one). */
  version: z.number().int().min(1),
  title: z.string().optional(),
  /** Null clears it. */
  rationale: z.string().nullable().optional(),
  /** Replaces all of its Links when given. */
  links: z.array(KnowledgeLinkDtoSchema).optional(),
};

function editing<K extends keyof typeof KNOWLEDGE_FIELDS_DTO_SCHEMAS>(kind: K) {
  return z.object({
    kind: z.literal(kind),
    ...frame,
    fields: KNOWLEDGE_FIELDS_DTO_SCHEMAS[kind].optional(),
  });
}

/**
 * Changes a Draft; what is left out stays as it is, and `fields` or `links`
 * replace all of theirs. `kind` must be the Draft's own Kind, which never changes
 * (400 `KNOWLEDGE_KIND_MISMATCH`).
 */
export const EditKnowledgeItemDtoSchema = z.discriminatedUnion('kind', [
  editing('product-overview'),
  editing('goal'),
  editing('persona'),
  editing('scenario'),
  editing('requirement'),
  editing('constraint'),
  editing('term'),
  editing('business-rule'),
  editing('integration'),
  editing('decision'),
  editing('open-question'),
]);

export type EditKnowledgeItemDto = z.infer<typeof EditKnowledgeItemDtoSchema>;
