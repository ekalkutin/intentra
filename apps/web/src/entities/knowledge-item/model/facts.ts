import {
  KnowledgeKindDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { FIELD_CONTROLS, kindFields } from './kind-fields';

/** What sort of fact it is, and so how it reads. */
export const FACT_TYPES = {
  /** A choice, such as a Requirement's priority. */
  choice: 'choice',
  /** How many entries a list holds, such as acceptance criteria. */
  count: 'count',
  /** A short text, such as an Integration's external system. */
  text: 'text',
  /** Whether an Open Question has an Approved answer. */
  answer: 'answer',
} as const;

export type Fact =
  | {
      readonly type: typeof FACT_TYPES.choice;
      readonly field: string;
      readonly value: string;
    }
  | {
      readonly type: typeof FACT_TYPES.count;
      readonly field: string;
      readonly count: number;
    }
  | {
      readonly type: typeof FACT_TYPES.text;
      readonly field: string;
      readonly value: string;
    }
  | { readonly type: typeof FACT_TYPES.answer; readonly answeredBy: string[] };

/**
 * The short facts worth seeing next to an item in a list: its choices, how
 * many entries its lists hold, its one-line texts. The main field and long
 * texts are left out, and so are gaps.
 */
export function factsOf(item: KnowledgeItemDto): Fact[] {
  const values: Record<string, unknown> = item.fields;
  const { main, fields } = kindFields(item.kind);
  const facts: Fact[] = fields.flatMap((field): Fact[] => {
    const value = values[field.name];
    if (field.name === main) {
      return [];
    }
    if (field.control === FIELD_CONTROLS.choice && typeof value === 'string') {
      return [{ type: FACT_TYPES.choice, field: field.name, value }];
    }
    if (
      (field.control === FIELD_CONTROLS.list ||
        field.control === FIELD_CONTROLS.alternatives) &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      return [
        { type: FACT_TYPES.count, field: field.name, count: value.length },
      ];
    }
    if (field.control === FIELD_CONTROLS.text && typeof value === 'string') {
      return [{ type: FACT_TYPES.text, field: field.name, value }];
    }
    return [];
  });

  return item.kind === KnowledgeKindDtoSchema.enum['open-question']
    ? [{ type: FACT_TYPES.answer, answeredBy: item.answeredBy }, ...facts]
    : facts;
}
