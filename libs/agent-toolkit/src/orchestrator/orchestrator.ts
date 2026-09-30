import { Agent } from '@mastra/core/agent';
import type { MastraModelConfig } from '@mastra/core/llm';

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
  readonly onUnexpectedError: UnexpectedErrorListener;
};

/**
 * The Orchestrator: the one Agent people talk to. It works with one Member in
 * one Project, both taken from the request context, and does what the lower
 * of its level there and the Member's Project Role allows.
 */
export function createOrchestrator({
  model,
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
    tools: reportingFailures(ORCHESTRATOR_TOOLS, onUnexpectedError),
    requestContextSchema: orchestratorContextSchema,
  });
}

export type Orchestrator = ReturnType<typeof createOrchestrator>;
