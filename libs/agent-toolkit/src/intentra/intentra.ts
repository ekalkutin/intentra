import { Agent, type ToolsInput } from '@mastra/core/agent';
import type { MastraMemory } from '@mastra/core/memory';
import { ToolCallFilter } from '@mastra/core/processors';
import { createSkill } from '@mastra/core/skills';

import { ProjectRoleDtoSchema } from '@intentra/contracts/workspace';

import { agentToolsOf } from '../agent-tools.js';
import { isReadOnlyTool } from '../catalog.js';

import type { AgentDefinition } from './agent-definition.js';
import {
  intentraContextSchema,
  type IntentraContext,
} from './intentra-context.js';
import { frameInstructions } from './intentra-instructions.js';
import type { UnexpectedErrorListener } from './reporting-failures.js';

export type IntentraOptions = {
  readonly intentra: AgentDefinition;
  /** The Specialists Intentra may call. */
  readonly specialists: readonly AgentDefinition[];
  /** Where its Conversations are kept; the caller picks the thread and its Member per call. */
  readonly memory: MastraMemory;
  readonly onUnexpectedError: UnexpectedErrorListener;
};

/**
 * Intentra, the one Agent people talk to, with the Specialists it may
 * call as Mastra sub-agents, each shown to it as a tool with the Specialist's
 * name and description. They work with one Member in one Project, both
 * taken from the request context, and do what the lower of their level there
 * and the Member's Project Role allows. Past tool calls are kept in memory
 * but not sent to the model again: Intentra reads the knowledge
 * afresh instead.
 */
export function createIntentra({
  intentra,
  specialists,
  memory,
  onUnexpectedError,
}: IntentraOptions) {
  const keys = toolKeys(specialists.map(specialist => specialist.name));
  const agents = Object.fromEntries(
    specialists.map((specialist, index) => [
      keys[index]!,
      createAgent(specialist, onUnexpectedError, {}, StatelessAgent),
    ]),
  );

  return createAgent(intentra, onUnexpectedError, {
    memory,
    agents,
    inputProcessors: [new ToolCallFilter()],
  });
}

export type Intentra = ReturnType<typeof createIntentra>;

type AgentConfig = ConstructorParameters<
  typeof Agent<string, ToolsInput, undefined, IntentraContext>
>[0];

/**
 * A Specialist keeps nothing: it works on Intentra's prompt alone.
 * Mastra would otherwise give it Intentra's memory and keep its turns
 * in threads of their own, which belong to no Conversation and would outlive
 * it. Its call and answer stay in the Conversation as a tool call.
 */
class StatelessAgent extends Agent<
  string,
  ToolsInput,
  undefined,
  IntentraContext
> {
  public override hasOwnMemory(): boolean {
    return true;
  }

  public override async getMemory(): Promise<undefined> {
    return undefined;
  }

  public override __setMemory(): void {}
}

function createAgent(
  definition: AgentDefinition,
  onUnexpectedError: UnexpectedErrorListener,
  extra: Pick<AgentConfig, 'memory' | 'agents' | 'inputProcessors'>,
  AgentClass: typeof Agent<
    string,
    ToolsInput,
    undefined,
    IntentraContext
  > = Agent,
) {
  const tools = agentToolsOf(definition.toolIds, onUnexpectedError);
  const readOnlyTools = Object.fromEntries(
    Object.entries(tools).filter(([, tool]) => isReadOnlyTool(tool)),
  );

  return new AgentClass({
    id: toolKeys([definition.name])[0]!,
    name: definition.name,
    description: definition.description,
    instructions: ({ requestContext }) =>
      frameInstructions(requestContext.get('project'), definition.instructions),
    model: definition.model,
    // No edited text can make an Agent write for a Viewer.
    tools: ({ requestContext }) =>
      requestContext.get('project').role === ProjectRoleDtoSchema.enum.viewer
        ? readOnlyTools
        : tools,
    skills: definition.skills.map(skill => createSkill(skill)),
    defaultOptions: {
      modelSettings: {
        ...(definition.temperature !== null && {
          temperature: definition.temperature,
        }),
        ...(definition.maxOutputTokens !== null && {
          maxOutputTokens: definition.maxOutputTokens,
        }),
      },
      ...(definition.reasoningEffort !== null && {
        providerOptions: {
          openrouter: { reasoning: { effort: definition.reasoningEffort } },
        },
      }),
    },
    requestContextSchema: intentraContextSchema,
    ...extra,
  });
}

/** Names the model can call them by, such as `ux_researcher`; a repeated one gets a number. */
function toolKeys(names: readonly string[]): string[] {
  const taken = new Set<string>();

  return names.map(name => {
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || 'agent';
    let key = base;
    for (let n = 2; taken.has(key); n++) key = `${base}_${n}`;
    taken.add(key);

    return key;
  });
}
