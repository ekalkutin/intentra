import { Agent } from '@mastra/core/agent';
import type { MastraModelConfig } from '@mastra/core/llm';
import type { MastraMemory } from '@mastra/core/memory';
import { ToolCallFilter } from '@mastra/core/processors';

import { ORCHESTRATOR_TOOLS } from '../catalog.js';

import { orchestratorContextSchema } from './orchestrator-context.js';
import { orchestratorInstructions } from './orchestrator-instructions.js';
import {
  reportingFailures,
  type UnexpectedErrorListener,
} from './reporting-failures.js';

export type OrchestratorOptions = {
  /** Such as `{ id: 'openrouter/anthropic/claude-sonnet-5', apiKey }`. */
  readonly model: MastraModelConfig;
  /** Where its Conversations are kept; the caller picks the thread and its Member per call. */
  readonly memory: MastraMemory;
  readonly onUnexpectedError: UnexpectedErrorListener;
};

/**
 * The Orchestrator: the one Agent people talk to. It works with one Member in
 * one Project, both taken from the request context, and does what the lower
 * of its level there and the Member's Project Role allows. Past tool calls
 * are kept in its memory but not sent to the model again: it reads the
 * knowledge afresh instead.
 */
export function createOrchestrator({
  model,
  memory,
  onUnexpectedError,
}: OrchestratorOptions) {
  return new Agent({
    id: 'orchestrator',
    name: 'orchestrator',
    description:
      'Interviews a person about their product and records what it learns as Drafts of Project Knowledge.',
    instructions: ({ requestContext }) =>
      orchestratorInstructions(requestContext.get('project')),
    model,
    memory,
    tools: reportingFailures(ORCHESTRATOR_TOOLS, onUnexpectedError),
    inputProcessors: [new ToolCallFilter()],
    requestContextSchema: orchestratorContextSchema,
  });
}

export type Orchestrator = ReturnType<typeof createOrchestrator>;
