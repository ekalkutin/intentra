import { z } from 'zod';

import { FIELD_CONTROLS, kindFields } from '@/entities/knowledge-item';
import {
  KnowledgeLinkDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
  type KnowledgeLinkDto,
} from '@intentra/contracts/workspace';

/** The server's limits (the Knowledge domain's value objects). */
const TITLE_MAX = 200;
const RATIONALE_MAX = 2000;
const TEXT_MAX = 5000;

export type AlternativeValue = { alternative: string; reason: string };

/** A field as the form holds it: text, a choice ('' for none), a list or alternatives. */
export type FieldValue = string | string[] | AlternativeValue[];

export type EditorValues = {
  title: string;
  rationale: string;
  fields: Record<string, FieldValue>;
  links: KnowledgeLinkDto[];
};

/** What a new Draft of a Kind starts with. */
export function emptyValues(kind: KnowledgeKindDto): EditorValues {
  return {
    title: '',
    rationale: '',
    fields: Object.fromEntries(
      kindFields(kind).fields.map(field => [
        field.name,
        field.control === FIELD_CONTROLS.list ||
        field.control === FIELD_CONTROLS.alternatives
          ? []
          : '',
      ]),
    ),
    links: [],
  };
}

/** A Knowledge Item as the form holds it, to edit it or to replace it. */
export function valuesFrom(item: KnowledgeItemDto): EditorValues {
  const fields: Record<string, unknown> = item.fields;

  return {
    title: item.title,
    rationale: item.rationale ?? '',
    fields: Object.fromEntries(
      kindFields(item.kind).fields.map(field => {
        const value = fields[field.name];
        if (field.control === FIELD_CONTROLS.alternatives) {
          const alternatives = value as {
            alternative: string;
            reason: string | null;
          }[];
          return [
            field.name,
            alternatives.map(({ alternative, reason }) => ({
              alternative,
              reason: reason ?? '',
            })),
          ];
        }
        if (field.control === FIELD_CONTROLS.list) {
          return [field.name, [...(value as string[])]];
        }
        return [field.name, (value as string | null) ?? ''];
      }),
    ),
    links: item.links.map(link => ({ ...link })),
  };
}

/**
 * The form's fields as the API takes them: texts trimmed, an empty optional
 * text or choice sent as null, blank list entries and alternatives dropped.
 */
export function toFieldsDto(
  kind: KnowledgeKindDto,
  fields: Readonly<Record<string, FieldValue>>,
): Record<string, unknown> {
  const { main, fields: described } = kindFields(kind);

  return Object.fromEntries(
    described.map(field => {
      const value = fields[field.name];
      if (field.control === FIELD_CONTROLS.alternatives) {
        const alternatives = (value as AlternativeValue[] | undefined) ?? [];
        return [
          field.name,
          alternatives
            .map(({ alternative, reason }) => ({
              alternative: alternative.trim(),
              reason: reason.trim() || null,
            }))
            .filter(({ alternative }) => alternative.length > 0),
        ];
      }
      if (field.control === FIELD_CONTROLS.list) {
        const entries = (value as string[] | undefined) ?? [];
        return [
          field.name,
          entries.map(entry => entry.trim()).filter(entry => entry.length > 0),
        ];
      }
      const text = ((value as string | undefined) ?? '').trim();
      return [field.name, field.name === main ? text : text || null];
    }),
  );
}

const tooLong = (maximum: number, path: (string | number)[]) =>
  ({
    code: 'too_big',
    origin: 'string',
    maximum,
    inclusive: true,
    input: '',
    path,
  }) as const;

/**
 * The form's checks: a title, the Kind's main field, and the server's lengths,
 * so that most mistakes show at their field before anything is sent.
 */
export function editorSchema(kind: KnowledgeKindDto) {
  const { main, fields: described } = kindFields(kind);

  return z.object({
    title: z.string().trim().min(1).max(TITLE_MAX),
    rationale: z.string().trim().max(RATIONALE_MAX),
    fields: z
      .record(
        z.string(),
        z.union([
          z.string(),
          z.array(z.string()),
          z.array(z.object({ alternative: z.string(), reason: z.string() })),
        ]),
      )
      .superRefine((fields, context) => {
        const mainValue = fields[main];
        if (typeof mainValue !== 'string' || mainValue.trim().length === 0) {
          context.addIssue({
            code: 'too_small',
            origin: 'string',
            minimum: 1,
            inclusive: true,
            input: mainValue,
            path: [main],
          });
        }
        for (const field of described) {
          const value = fields[field.name];
          if (typeof value === 'string' && value.trim().length > TEXT_MAX) {
            context.addIssue(tooLong(TEXT_MAX, [field.name]));
          }
          if (field.control === FIELD_CONTROLS.list && Array.isArray(value)) {
            value.forEach((entry, index) => {
              if (typeof entry === 'string' && entry.trim().length > TEXT_MAX) {
                context.addIssue(tooLong(TEXT_MAX, [field.name, index]));
              }
            });
          }
        }
      }),
    links: z.array(KnowledgeLinkDtoSchema.extend({ key: z.string().min(1) })),
  });
}
