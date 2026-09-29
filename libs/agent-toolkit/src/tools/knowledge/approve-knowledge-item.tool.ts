import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const approveKnowledgeItemTool = createTool({
  id: 'approve_knowledge_item',
  description:
    "Approves a Draft: the person confirms it is true for the Project. Do it only when the person asks you to, after showing them the version you send. Needs a Maintainer's token.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    key: keySchema,
    version: versionSchema,
  }),
  outputSchema: knowledgeItemSchema,
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false } },
  execute: async ({ projectId, key, version }, { requestContext }) =>
    requestContext
      .get('apis')
      .workspace.knowledge.approve(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
        { version },
      ),
});
