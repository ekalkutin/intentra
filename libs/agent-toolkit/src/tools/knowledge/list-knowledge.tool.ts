import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import { projectIdSchema } from './knowledge-item.schema.js';

export const listKnowledgeTool = createTool({
  id: 'list_knowledge',
  description:
    "Lists a Project's knowledge, briefly: key, kind, title, the main field and status. By default only Approved knowledge, the only kind to rely on when implementing. To avoid recording duplicates, ask for statuses ['approved', 'draft', 'rejected']: a Rejected item was turned down as untrue and must not be recorded again. Use get_knowledge_item for all of an item's fields.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    kind: KnowledgeKindDtoSchema.optional(),
    statuses: z
      .array(KnowledgeStatusDtoSchema)
      .min(1)
      .default([KnowledgeStatusDtoSchema.enum.approved])
      .describe('Any of these statuses.'),
    needsReview: z
      .boolean()
      .optional()
      .describe('Only items marked Needs Review (true) or only unmarked ones.'),
    unlinked: z
      .literal(true)
      .optional()
      .describe(
        'Only the Approved items linked to nothing, outside the Project Frame; statuses and needsReview are then left aside.',
      ),
    take: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
  }),
  outputSchema: z.object({
    items: z.array(
      z.object({
        key: z.string(),
        kind: KnowledgeKindDtoSchema,
        title: z.string(),
        mainField: z.string(),
        status: KnowledgeStatusDtoSchema,
        needsReview: z.boolean(),
        version: z.number(),
      }),
    ),
    total: z.number().describe('How many match, across every page.'),
    canRecord: z
      .array(KnowledgeKindDtoSchema)
      .describe('The Kinds you may record Drafts of in this Project.'),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId, ...query }, { requestContext }) => {
    const page = await requestContext
      .get('apis')
      .knowledge.list(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        query,
      );

    return {
      items: page.items.map(
        ({ key, kind, title, mainField, status, needsReview, version }) => ({
          key,
          kind,
          title,
          mainField,
          status,
          needsReview,
          version,
        }),
      ),
      total: page.total,
      canRecord: page.access.canRecord,
    };
  },
});
