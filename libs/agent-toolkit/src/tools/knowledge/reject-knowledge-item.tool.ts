import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const rejectKnowledgeItemTool = createTool({
  id: 'reject_knowledge_item',
  description:
    "Rejects a Draft as not true for the Project; it is kept so that no one records it again. Do it only when the person asks you to. For a Draft recorded by mistake use delete_knowledge_draft instead. Needs a Maintainer's token.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    key: keySchema,
    version: versionSchema,
    reason: z
      .string()
      .nullable()
      .default(null)
      .describe('Why it is not true, if the person said.'),
  }),
  outputSchema: knowledgeItemSchema,
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false } },
  execute: async ({ projectId, key, ...data }, { requestContext }) =>
    requestContext
      .get('apis')
      .knowledge.reject(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
        data,
      ),
});
