import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const confirmKnowledgeItemTool = createTool({
  id: 'confirm_knowledge_item',
  description:
    "Confirms that an item marked Needs Review still holds on what changed: its Links to the changed items (reviewCauses) move onto their replacements, or away if there is none. Do it only after the person has checked it. A Draft needs a Contributor's token; an Approved item a Maintainer's.",
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
      .workspace.knowledge.confirm(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
        { version },
      ),
});
