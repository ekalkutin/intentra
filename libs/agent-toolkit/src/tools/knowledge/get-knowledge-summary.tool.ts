import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { KnowledgeKindDtoSchema } from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import { projectIdSchema } from './knowledge-item.schema.js';

const count = z.number().int().min(0);

export const getKnowledgeSummaryTool = createTool({
  id: 'get_knowledge_summary',
  description:
    "Counts a Project's whole knowledge in one call: for each Kind, how many items are Draft, Approved, Rejected and Obsolete, and how many are marked Needs Review. Use it to see what the Project knows and where the gaps are (a Kind with nothing Approved, a pile of Drafts waiting, items to review) before listing items with list_knowledge.",
  inputSchema: z.object({ projectId: projectIdSchema }),
  outputSchema: z.object({
    kinds: z
      .array(
        z.object({
          kind: KnowledgeKindDtoSchema,
          draft: count,
          approved: count,
          rejected: count,
          obsolete: count,
          needsReview: count.describe(
            'Drafts and Approved items marked Needs Review.',
          ),
        }),
      )
      .describe('Every Kind, empty ones included, in the model order.'),
    canRecord: z
      .array(KnowledgeKindDtoSchema)
      .describe('The Kinds you may record Drafts of in this Project.'),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId }, { requestContext }) => {
    const summary = await requestContext
      .get('apis')
      .knowledge.summary(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
      );

    return {
      kinds: summary.kinds.map(({ kind, statuses, needsReview }) => ({
        kind,
        ...statuses,
        needsReview,
      })),
      canRecord: summary.access.canRecord,
    };
  },
});
