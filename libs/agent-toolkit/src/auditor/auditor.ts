import { Agent, type ToolsInput } from '@mastra/core/agent';

import { agentToolsOf } from '../agent-tools.js';
import type { AgentDefinition } from '../intentra/agent-definition.js';
import type { UnexpectedErrorListener } from '../intentra/reporting-failures.js';

import {
  auditorContextSchema,
  type AuditorContext,
} from './auditor-context.js';
import { frameAuditorInstructions } from './auditor-instructions.js';

export type AuditorOptions = {
  readonly auditor: AgentDefinition;
  readonly onUnexpectedError: UnexpectedErrorListener;
};

/** What an Analysis Run asks the Auditor to look over. */
export const AUDIT_TASKS = {
  wholeProject:
    "Look over the whole Project's Approved knowledge for contradictions, ambiguities and doubtful rules, and record each finding as an Open Question.",
} as const;

/**
 * The Agent that carries out Analysis Runs: no memory and no Conversation, a
 * task given by the code, the Project taken from the request context. Its
 * tools work as Intentra itself, so whatever tools it is given, it reads and
 * records Open Questions only.
 */
export function createAuditor({ auditor, onUnexpectedError }: AuditorOptions) {
  return new Agent<string, ToolsInput, undefined, AuditorContext>({
    id: 'auditor',
    name: auditor.name,
    description: auditor.description,
    instructions: ({ requestContext }) =>
      frameAuditorInstructions(
        requestContext.get('project'),
        auditor.instructions,
      ),
    model: auditor.model,
    tools: agentToolsOf(auditor.toolIds, onUnexpectedError),
    defaultOptions: {
      modelSettings: {
        ...(auditor.temperature !== null && {
          temperature: auditor.temperature,
        }),
        ...(auditor.maxOutputTokens !== null && {
          maxOutputTokens: auditor.maxOutputTokens,
        }),
      },
      ...(auditor.reasoningEffort !== null && {
        providerOptions: {
          openrouter: { reasoning: { effort: auditor.reasoningEffort } },
        },
      }),
    },
    requestContextSchema: auditorContextSchema,
  });
}

export type Auditor = ReturnType<typeof createAuditor>;
