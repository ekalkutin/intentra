import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import { keySchema, projectIdSchema } from './knowledge-item.schema.js';

export const getKnowledgeDependenciesTool = createTool({
  id: 'get_knowledge_dependencies',
  description:
    'Gives what approving a Knowledge Item takes along: everything it depends on, at any depth, and the Draft Open Questions a Draft among them answers, the item itself first; with the depends-on and answers Links between them. Show it to the person before approving, so that no Draft in the cascade goes unseen; approve the Drafts together with approve_knowledge_items.',
  inputSchema: z.object({ projectId: projectIdSchema, key: keySchema }),
  outputSchema: z.object({
    items: z.array(
      z.object({
        key: z.string(),
        kind: KnowledgeKindDtoSchema,
        title: z.string(),
        mainField: z.string(),
        status: KnowledgeStatusDtoSchema,
        needsReview: z.boolean(),
        version: z.number(),
      }),
    ),
    links: z
      .array(z.object({ from: z.string(), to: z.string() }))
      .describe('The depends-on Links.'),
    answers: z
      .array(z.object({ from: z.string(), to: z.string() }))
      .describe(
        'The answers Links to Draft Open Questions, approved in the same step.',
      ),
    dependencyNeedsReview: z
      .boolean()
      .describe('Whether anything below the item itself is under review.'),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId, key }, { requestContext }) => {
    const cascade = await requestContext
      .get('apis')
      .knowledge.dependencies(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
      );

    return {
      items: cascade.items.map(({ access: _access, ...item }) => item),
      links: cascade.links,
      answers: cascade.answers,
      dependencyNeedsReview: cascade.dependencyNeedsReview,
    };
  },
});
