import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import {
  KNOWLEDGE_CONTEXT_MAX_ANCHORS,
  KnowledgeContextDetailDtoSchema,
  KnowledgeContextRoleDtoSchema,
  KnowledgeKindDtoSchema,
  KnowledgeLinkDtoSchema,
  KnowledgeLinkTypeDtoSchema,
} from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import { keySchema, projectIdSchema } from './knowledge-item.schema.js';

export const getContextTool = createTool({
  id: 'get_context',
  description:
    "Gives the Context Pack for a task: the Project's Approved knowledge gathered from its Anchors along the Links. What the Anchors rest on (at any depth), what links to them and may break, the Terms used, what conflicts, and the open questions about them, each under its role; the nearest in full, the rest on one line. Pick as Anchors the Approved items the task is about, from list_knowledge (several at once if the task spans them). Read get_project_frame once per session as well. A Draft cannot be an Anchor: ask the person to approve it.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    anchors: z
      .array(keySchema)
      .min(1)
      .max(KNOWLEDGE_CONTEXT_MAX_ANCHORS)
      .describe('The Knowledge Keys of the Approved items the task is about.'),
  }),
  outputSchema: z.object({
    markdown: z.string().describe('The pack to read.'),
    anchors: z.array(z.string()),
    items: z.array(
      z.object({
        key: z.string(),
        kind: KnowledgeKindDtoSchema,
        title: z.string(),
        mainField: z.string(),
        role: KnowledgeContextRoleDtoSchema,
        distance: z.number(),
        detail: KnowledgeContextDetailDtoSchema,
        needsReview: z.boolean(),
        reviewCauses: z.array(z.string()).optional(),
        fields: z.record(z.string(), z.unknown()).optional(),
        rationale: z.string().nullable().optional(),
        links: z.array(KnowledgeLinkDtoSchema).optional(),
      }),
    ),
    links: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        type: KnowledgeLinkTypeDtoSchema,
      }),
    ),
    draftsNearby: z.array(
      z.object({
        key: z.string(),
        kind: KnowledgeKindDtoSchema,
        title: z.string(),
      }),
    ),
    frameSize: z.number(),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId, anchors }, { requestContext }) => {
    const pack = await requestContext
      .get('apis')
      .knowledge.context(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        { anchors },
      );

    return {
      ...pack,
      markdown: `${pack.markdown}\nProject frame: ${pack.frameSize} items that hold for every task. Read them with get_project_frame once per session, if you have not yet.\n`,
    };
  },
});
