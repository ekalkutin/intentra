import { Agent, type ToolsInput } from '@mastra/core/agent';

import { agentToolsOf } from '../agent-tools.js';
import { cachedInstructions } from '../cached-instructions.js';
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
  /** Only what changed since the last run, each with the knowledge around it. */
  changes: (approved: readonly string[], retired: readonly string[]) =>
    [
      'Since the last check of this Project, some of its knowledge changed. Look at each changed item with the knowledge around it (get_context with it as an Anchor) for contradictions, ambiguities and doubtful rules it brings in, and record each finding as an Open Question. Leave the rest of the Project alone.',
      approved.length > 0 ? `Approved since then: ${approved.join(', ')}.` : '',
      retired.length > 0
        ? `Retired since then (read them with get_knowledge_item; check what still relies on them): ${retired.join(', ')}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
};

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
      cachedInstructions(
        frameAuditorInstructions(
          requestContext.get('project'),
          auditor.instructions,
        ),
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
