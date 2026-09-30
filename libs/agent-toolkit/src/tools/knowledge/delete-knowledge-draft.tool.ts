import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const deleteKnowledgeDraftTool = createTool({
  id: 'delete_knowledge_draft',
  description:
    'Deletes a Draft recorded by mistake, such as under the wrong Kind or twice, leaving no trace. It says nothing about whether it is true: to turn down untrue knowledge use reject_knowledge_item.',
  inputSchema: z.object({
    projectId: projectIdSchema,
    key: keySchema,
    version: versionSchema,
  }),
  outputSchema: z.object({ deleted: z.string() }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false, destructiveHint: true } },
  execute: async ({ projectId, key, version }, { requestContext }) => {
    await requestContext
      .get('apis')
      .knowledge.delete(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
        { version },
      );

    return { deleted: key };
  },
});
