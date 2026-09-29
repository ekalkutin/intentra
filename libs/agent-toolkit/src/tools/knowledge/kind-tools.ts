import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import {
  DecisionFieldsDtoSchema,
  RequirementFieldsDtoSchema,
  TermFieldsDtoSchema,
  type EditKnowledgeItemDto,
  type KnowledgeKindDto,
  type RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

import {
  keySchema,
  knowledgeItemSchema,
  projectIdSchema,
  versionSchema,
} from './knowledge-item.schema.js';

/** Every Kind gets its own record and edit tools, generated from its fields. */
const KINDS = [
  {
    kind: 'term',
    noun: 'Term',
    about: "a word of the Project's shared language and what it means",
    fields: TermFieldsDtoSchema,
  },
  {
    kind: 'requirement',
    noun: 'Requirement',
    about:
      'something the Project wants from the system: a function it performs or a quality it has',
    fields: RequirementFieldsDtoSchema,
  },
  {
    kind: 'decision',
    noun: 'Decision',
    about:
      'a choice the Project has made, why, and which alternatives were turned down',
    fields: DecisionFieldsDtoSchema,
  },
] as const satisfies readonly {
  readonly kind: KnowledgeKindDto;
  readonly noun: string;
  readonly about: string;
  readonly fields: z.ZodObject;
}[];

type KindSpec = (typeof KINDS)[number];

function createRecordTool(spec: KindSpec) {
  return createTool({
    id: `record_${spec.kind}`,
    description: `Records a ${spec.noun}, ${spec.about}, as a Draft in a Project. A Draft is not part of the Project's knowledge until a Maintainer approves it. Fill only what the person actually said: only the main field is required, and an empty field is a gap to ask about, not something to invent. Check list_knowledge first so as not to record what is already there or was rejected.`,
    inputSchema: z.object({
      projectId: projectIdSchema,
      title: z.string().describe(`A short name for the ${spec.noun}.`),
      rationale: z
        .string()
        .describe(
          'What it rests on: a short quote or summary of what the person said.',
        ),
      fields: spec.fields,
    }),
    outputSchema: knowledgeItemSchema,
    requestContextSchema: toolContextSchema,
    mcp: { annotations: { readOnlyHint: false } },
    execute: async ({ projectId, ...data }, { requestContext }) =>
      requestContext.get('apis').workspace.knowledge.record(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        // The fields schema is this Kind's own, so the pair always matches.
        { kind: spec.kind, ...data } as RecordKnowledgeItemDto,
      ),
  });
}

function createEditTool(spec: KindSpec) {
  return createTool({
    id: `edit_${spec.kind}`,
    description: `Edits a Draft ${spec.noun}. What is left out stays as it is; fields, when given, replace all of them. Read it with get_knowledge_item first and send back its version. Only a Draft can be edited.`,
    inputSchema: z.object({
      projectId: projectIdSchema,
      key: keySchema,
      version: versionSchema,
      title: z.string().optional(),
      rationale: z.string().optional(),
      fields: spec.fields.optional(),
    }),
    outputSchema: knowledgeItemSchema,
    requestContextSchema: toolContextSchema,
    mcp: { annotations: { readOnlyHint: false } },
    execute: async ({ projectId, key, ...data }, { requestContext }) =>
      requestContext.get('apis').workspace.knowledge.edit(
        requestContext.get('caller'),
        requestContext.get('workspaceId'),
        projectId,
        key,
        // The fields schema is this Kind's own, so the pair always matches.
        { kind: spec.kind, ...data } as EditKnowledgeItemDto,
      ),
  });
}

export const KIND_TOOLS = KINDS.flatMap(spec => [
  createRecordTool(spec),
  createEditTool(spec),
]);
