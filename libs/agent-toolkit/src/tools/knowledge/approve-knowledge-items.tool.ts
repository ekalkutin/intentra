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
    "Approves Drafts together, all or nothing: the person confirms they are true for the Project. What a Draft depends on must be Approved already or among them; get_knowledge_dependencies shows the whole cascade. Do it only when the person asks you to, after showing them the versions you send. Needs a Maintainer's token.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    items: z.array(z.object({ key: keySchema, version: versionSchema })).min(1),
  }),
  outputSchema: z.object({ approved: z.array(knowledgeItemSchema) }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false } },
  execute: async ({ projectId, items }, { requestContext }) => ({
    approved: await requestContext
      .get('apis')
      .workspace.knowledge.approveTogether(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        { items },
      ),
  }),
});
