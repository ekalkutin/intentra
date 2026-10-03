import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

export const assignToFeatureTool = createTool({
  id: 'assign_to_feature',
  description:
    "Puts Approved Scenarios, Requirements and Business Rules into an Approved Feature, moves them there from another Feature, or takes them out of theirs (feature null), all or nothing. They keep their Knowledge Keys: no replacement is recorded. An item is part of one Feature at most. A Draft is put into a Feature with its edit_ tool instead (a part-of Link). Do it only when the person asks you to, after showing them the items and versions you send. Needs a Maintainer's token.",
  inputSchema: z.object({
    projectId: projectIdSchema,
    feature: keySchema
      .nullable()
      .describe(
        'The Knowledge Key of the Approved Feature, such as FEAT-2; null takes the items out of their Feature.',
      ),
    items: z
      .array(z.object({ key: keySchema, version: versionSchema }))
      .min(1)
      .refine(
        items => new Set(items.map(({ key }) => key)).size === items.length,
        { message: 'Each Knowledge Key may appear once' },
      ),
  }),
  outputSchema: z.object({ assigned: z.array(knowledgeItemSchema) }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: false } },
  execute: async ({ projectId, feature, items }, { requestContext }) => ({
    assigned: await requestContext
      .get('apis')
      .knowledge.assignToFeature(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        { feature, items },
      ),
  }),
});
