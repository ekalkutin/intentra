import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import {
  KnowledgeGapRuleDtoSchema,
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeGapRuleDto,
} from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import { projectIdSchema } from './knowledge-item.schema.js';

/** At most this many Gaps in one answer, the most basic first. */
const GAPS_SHOWN = 50;

/** What each rule misses, said to the agent. */
const MISSING: { readonly [R in KnowledgeGapRuleDto]: string } = {
  'no-product-overview':
    'The Project has no Product Overview: what the product is and for whom.',
  'no-persona': 'The Project has no Persona: who uses the product.',
  'no-goal': 'The Project has no Goal: what it wants to achieve.',
  'requirement-without-acceptance-criteria':
    'A Must Requirement has no acceptance criteria: how to check it is met.',
  'goal-without-success-metric':
    'A Goal has no success metric: how to tell it was reached.',
  'decision-without-rejected-alternatives':
    'A Decision names no rejected alternatives: what it was chosen over, and why.',
  'scenario-without-persona':
    'A Scenario names no Persona who performs it (a depends-on Link to one).',
  'persona-without-scenario':
    'A Persona performs no Scenario: what they do with the product.',
  'scenario-without-requirement':
    'No Requirement says what the system does in this Scenario.',
  'integration-without-use':
    'No Requirement or Business Rule rests on this Integration: what it is used for.',
  unlinked:
    'An Approved item linked to nothing: no Context Pack reaches it but as its own Anchor. Link it to what it relates to.',
};

export const listGapsTool = createTool({
  id: 'list_gaps',
  description:
    "Lists a Project's Gaps: what is missing from its knowledge that needs no judgement to see, such as no Persona yet, a Must Requirement without acceptance criteria, a Persona who performs no Scenario, or an Approved item linked to nothing. A Draft already closes a Gap. Use them to choose what to ask the person next; never fill a Gap by inventing the answer.",
  inputSchema: z.object({ projectId: projectIdSchema }),
  outputSchema: z.object({
    gaps: z
      .array(
        z.object({
          rule: KnowledgeGapRuleDtoSchema,
          missing: z.string().describe('What is missing.'),
          item: z
            .object({
              key: z.string(),
              kind: KnowledgeKindDtoSchema,
              title: z.string(),
              status: KnowledgeStatusDtoSchema,
            })
            .nullable()
            .describe('The item it is about; null for the Project as a whole.'),
        }),
      )
      .describe(`The first ${GAPS_SHOWN}, the Project's skeleton first.`),
    total: z.number().describe('How many Gaps the Project has.'),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ projectId }, { requestContext }) => {
    const { gaps } = await requestContext
      .get('apis')
      .knowledge.gaps(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
      );

    return {
      gaps: gaps
        .slice(0, GAPS_SHOWN)
        .map(({ rule, item }) => ({ rule, missing: MISSING[rule], item })),
      total: gaps.length,
    };
  },
});
