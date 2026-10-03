import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import {
  KnowledgeKindDtoSchema,
  KnowledgeLinkDtoSchema,
} from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import { projectIdSchema } from './knowledge-item.schema.js';

export const getProjectFrameTool = createTool({
  id: 'get_project_frame',
  description:
    "Gives the Project Frame: what holds for every task in the Project, whatever it links to. The Approved Product Overview, every Approved Constraint (laws, budgets, mandated infrastructure), every Approved non-functional Requirement and every Approved architecture Decision. Read it once per session before working on the Project's code, then a Context Pack per task with get_context.",
  inputSchema: z.object({ projectId: projectIdSchema }),
  outputSchema: z.object({
    markdown: z.string().describe('The frame to read.'),
    items: z.array(
      z.object({
        key: z.string(),
        kind: KnowledgeKindDtoSchema,
        title: z.string(),
        mainField: z.string(),
        fields: z.record(z.string(), z.unknown()),
        rationale: z.string().nullable(),
        links: z.array(KnowledgeLinkDtoSchema),
        needsReview: z.boolean(),
        reviewCauses: z.array(z.string()),
      }),
    ),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId }, { requestContext }) => {
    const frame = await requestContext
      .get('apis')
      .knowledge.frame(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
      );

    return frame;
  },
});
