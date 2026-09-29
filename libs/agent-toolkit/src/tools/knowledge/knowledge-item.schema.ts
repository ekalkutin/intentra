import { z } from 'zod';

import {
  DecisionFieldsDtoSchema,
  KnowledgeKindDtoSchema,
  KnowledgeSourceDtoSchema,
  KnowledgeStatusDtoSchema,
  RequirementFieldsDtoSchema,
  TermFieldsDtoSchema,
} from '@intentra/contracts/workspace';

/** A whole Knowledge Item, as tools give it back (each tool's `execute` is checked against it). */
export const knowledgeItemSchema = z.object({
  id: z.string(),
  key: z.string().describe('Its Knowledge Key, such as REQ-12.'),
  kind: KnowledgeKindDtoSchema,
  title: z.string(),
  mainField: z.string().describe("The text of its Kind's main field."),
  fields: z.union([
    TermFieldsDtoSchema,
    RequirementFieldsDtoSchema,
    DecisionFieldsDtoSchema,
  ]),
  status: KnowledgeStatusDtoSchema.describe(
    'A draft is not yet approved: never treat it as settled.',
  ),
  source: KnowledgeSourceDtoSchema,
  rationale: z.string().nullable(),
  authorId: z.string(),
  recordedAt: z.string(),
  lastEditedBy: z.string().nullable(),
  lastEditedAt: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  version: z
    .number()
    .describe(
      'Send it back with any change; a changed item must be read again.',
    ),
  access: z
    .object({
      canEdit: z.boolean(),
      canDelete: z.boolean(),
      canApprove: z.boolean(),
      canReject: z.boolean(),
    })
    .describe('What you may do with it right now.'),
});

export const projectIdSchema = z
  .string()
  .describe('The id of the Project, from list_projects.');

export const keySchema = z
  .string()
  .describe('The Knowledge Key of the item, such as REQ-12.');

export const versionSchema = z
  .number()
  .int()
  .min(1)
  .describe(
    'The version you last read; the change is refused if it has changed since.',
  );
