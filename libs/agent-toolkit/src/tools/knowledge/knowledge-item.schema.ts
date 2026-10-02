import { z } from 'zod';

import {
  KNOWLEDGE_FIELDS_DTO_SCHEMAS,
  KnowledgeKindDtoSchema,
  KnowledgeLinkDtoSchema,
  KnowledgeSourceDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

const {
  'product-overview': productOverview,
  goal,
  persona,
  scenario,
  requirement,
  constraint,
  term,
  'business-rule': businessRule,
  integration,
  decision,
  'open-question': openQuestion,
} = KNOWLEDGE_FIELDS_DTO_SCHEMAS;

/** A whole Knowledge Item, as tools give it back (each tool's `execute` is checked against it). */
export const knowledgeItemSchema = z.object({
  id: z.string(),
  key: z.string().describe('Its Knowledge Key, such as REQ-12.'),
  kind: KnowledgeKindDtoSchema,
  title: z.string(),
  mainField: z.string().describe("The text of its Kind's main field."),
  fields: z
    .union([
      productOverview,
      goal,
      persona,
      scenario,
      requirement,
      constraint,
      term,
      businessRule,
      integration,
      decision,
      openQuestion,
    ])
    .describe('The fields of its Kind.'),
  status: KnowledgeStatusDtoSchema.describe(
    'A draft is not yet approved: never treat it as settled. An obsolete item is no longer true.',
  ),
  source: KnowledgeSourceDtoSchema,
  rationale: z.string().nullable(),
  authorId: z
    .string()
    .nullable()
    .describe(
      'The Member who recorded it; null when Intentra did, in an Analysis Run.',
    ),
  recordedAt: z.string(),
  lastEditedBy: z.string().nullable(),
  lastEditedAt: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  supersedes: z
    .string()
    .nullable()
    .describe(
      'The Knowledge Key of the Approved item it replaces once approved.',
    ),
  supersededBy: z.string().nullable(),
  supersededAt: z.string().nullable(),
  supersededByKey: z
    .string()
    .nullable()
    .describe('The Knowledge Key of what replaced it, if it is Obsolete.'),
  retiredBy: z.string().nullable(),
  retiredAt: z.string().nullable(),
  retirementReason: z.string().nullable(),
  links: z.array(KnowledgeLinkDtoSchema),
  answeredBy: z
    .array(z.string())
    .describe('For an Open Question: the Approved items that answer it.'),
  needsReview: z
    .boolean()
    .describe(
      'Something it depends on or is justified by has changed: it may no longer be true.',
    ),
  reviewCauses: z
    .array(z.string())
    .describe('The Knowledge Keys of what changed.'),
  dependencyNeedsReview: z
    .boolean()
    .nullable()
    .describe(
      'Something further down what it depends on is under review: treat it with care.',
    ),
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
      canRecordReplacement: z.boolean(),
      canRetire: z.boolean(),
      canConfirm: z.boolean(),
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

export const linksSchema = z
  .array(KnowledgeLinkDtoSchema)
  .describe(
    'Links to other items, Draft or Approved: depends-on (it holds only while the target holds: a Scenario on the Persona who performs it, a Requirement on the Scenario it serves, a Business Rule on what it governs), uses-term (a Term whose word it uses), justified-by (the Decision that is its reason, and every Decision that shapes how it must be built, such as the UI decisions for a UI requirement), answers (an Open Question it settles), concerns (only from an Open Question: what it is about), conflicts-with (it contradicts the target). Link every item to what it relates to: agents building the product read the knowledge along these Links.',
  );
