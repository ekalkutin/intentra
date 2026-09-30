import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
} from './knowledge-item.schema.js';

export const getKnowledgeItemTool = createTool({
  id: 'get_knowledge_item',
  description:
    'Reads one Knowledge Item with all its fields, in any status, by its Knowledge Key.',
  inputSchema: z.object({ projectId: projectIdSchema, key: keySchema }),
  outputSchema: knowledgeItemSchema,
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId, key }, { requestContext }) =>
    requestContext
      .get('apis')
      .knowledge.get(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
      ),
});
