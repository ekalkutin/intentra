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

/**
 * A Kind's fields, each one optional and with no default: a field left out
 * stays as it is, null clears it.
 */
export function fieldChanges<S extends z.ZodObject>(
  schema: S,
): z.ZodType<Partial<z.output<S>>, Partial<z.input<S>>> {
  return z.object(
    Object.fromEntries(
      Object.entries(schema.shape).map(([name, field]) => {
        const changed = (
          field instanceof z.ZodDefault ? field.unwrap() : field
        ).optional();

        return [
          name,
          field.description ? changed.describe(field.description) : changed,
        ];
      }),
    ),
  ) as never;
}

function editing<K extends keyof typeof KNOWLEDGE_FIELDS_DTO_SCHEMAS>(kind: K) {
  return z.object({
    kind: z.literal(kind),
    ...frame,
    fields: fieldChanges(KNOWLEDGE_FIELDS_DTO_SCHEMAS[kind]).optional(),
  });
}

/**
 * Changes a Draft; what is left out stays as it is. Of its fields, only those
 * given change, and null clears one; `links` replace all of its Links.
 * `kind` must be the Draft's own Kind, which never changes
 * (400 `KNOWLEDGE_KIND_MISMATCH`).
 */
export const EditKnowledgeItemDtoSchema = z.discriminatedUnion('kind', [
  editing('product-overview'),
  editing('goal'),
  editing('persona'),
  editing('feature'),
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
