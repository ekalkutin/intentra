import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const retireKnowledgeItemTool = createTool({
  id: 'retire_knowledge_item',
  description:
    "Retires an Approved item that is no longer true, with nothing to replace it, such as when a feature is dropped; it becomes Obsolete. To change it instead, record its replacement with supersedes. Do it only when the person asks you to. Needs a Maintainer's token.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    key: keySchema,
    version: versionSchema,
    reason: z
      .string()
      .nullable()
      .default(null)
      .describe('Why it is no longer true, if the person said.'),
  }),
  outputSchema: knowledgeItemSchema,
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false } },
  execute: async ({ projectId, key, ...data }, { requestContext }) =>
    requestContext
      .get('apis')
      .workspace.knowledge.retire(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
        data,
      ),
});
