import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const approveKnowledgeItemsTool = createTool({
  id: 'approve_knowledge_items',
  description:
    "Approves Drafts together, all or nothing: the person confirms they are true for the Project. What a Draft depends on must be Approved already or among them, and so must a Draft Open Question it answers; get_knowledge_dependencies shows the whole cascade. Do it only when the person asks you to, after showing them the versions you send. Needs a Maintainer's token.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    items: z
      .array(z.object({ key: keySchema, version: versionSchema }))
      .min(1)
      .refine(
        items => new Set(items.map(({ key }) => key)).size === items.length,
        { message: 'Each Knowledge Key may appear once' },
      ),
  }),
  outputSchema: z.object({ approved: z.array(knowledgeItemSchema) }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false } },
  execute: async ({ projectId, items }, { requestContext }) => ({
    approved: await requestContext
      .get('apis')
      .knowledge.approveTogether(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        { items },
      ),
  }),
});
