import { Agent } from '@mastra/core/agent';

import { cachedInstructions } from '../cached-instructions.js';
import type { AgentDefinition } from '../intentra/agent-definition.js';

import {
  auditFindingsSchema,
  auditTask,
  type AuditFinding,
  type AuditGroup,
} from './audit-group.js';
import { frameAuditorInstructions } from './auditor-instructions.js';

export type AuditorOptions = {
  readonly auditor: AgentDefinition;
  /** The Project it checks, named in its instructions. */
  readonly project: { readonly name: string };
};

/**
 * The Agent that judges for Analysis Runs: no memory, no Conversation and no
 * tools, whatever tools its definition names. The code walks the Project and
 * hands it one group at a time (Agents ADR 0005).
 */
export function createAuditor({ auditor, project }: AuditorOptions) {
  return new Agent({
    id: 'auditor',
    name: auditor.name,
    description: auditor.description,
    instructions: cachedInstructions(
      frameAuditorInstructions(project, auditor.instructions),
    ),
    model: auditor.model,
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
  });
}

export type Auditor = ReturnType<typeof createAuditor>;

export type JudgeOptions = {
  readonly abortSignal?: AbortSignal;
  /** How many times a call its provider failed for a while is tried again. */
  readonly maxRetries?: number;
};

/** One model call: the findings about the group's item under check; rejects when the model fails. */
export async function judge(
  auditor: Auditor,
  group: AuditGroup,
  { abortSignal, maxRetries }: JudgeOptions = {},
): Promise<AuditFinding[]> {
  const output = await auditor.generate(auditTask(group), {
    structuredOutput: { schema: auditFindingsSchema },
    ...(maxRetries !== undefined && { modelSettings: { maxRetries } }),
    abortSignal,
  });
  if (output.error) {
    throw output.error;
  }

  return output.object.findings;
}
