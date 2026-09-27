import { handleChatStream } from '@mastra/ai-sdk';
import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { createTool } from '@mastra/core/tools';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { APICallError, JsonToSseTransformStream } from 'ai';

import {
  TOOL_CATALOG,
  type Caller,
  type ToolDefinition,
} from '@intentra/agent-surface';
import { agentRunKey } from '@intentra/contracts/agents';

import {
  AGENTS_OPTIONS,
  type AgentsModuleOptions,
} from '../../agents.module-definition.js';
import { AgentRuntime, type AgentRun } from '../../application/ports/index.js';
import type { AgentProfile } from '../../domain/entities/index.js';

import { openRouterModel } from './open-router.js';

/** Enough for a few delegations and tool calls, not for a runaway loop. */
const MAX_STEPS = 12;

const FAILURE_MESSAGE = 'The agent could not answer. Try again.';

/** What the person can fix themselves, told in their words. */
const PROVIDER_FAILURES: Readonly<Record<number, string>> = {
  401: 'OpenRouter rejected the key. Check it in the workspace settings.',
  402: 'The OpenRouter account has run out of credits.',
  404: 'OpenRouter does not know the model of one of the agents.',
  429: 'OpenRouter is rate limiting the requests. Try again in a minute.',
};

const describeFailure = (error: unknown): string =>
  (APICallError.isInstance(error) && error.statusCode !== undefined
    ? PROVIDER_FAILURES[error.statusCode]
    : undefined) ?? FAILURE_MESSAGE;

const agentKey = (profile: AgentProfile): string =>
  agentRunKey(profile.id.value);

/**
 * Builds the Mastra agents of a workspace for every request: the orchestrator,
 * with each specialist as a subagent it delegates to by the specialist's
 * description. Nothing is cached, so a changed profile or key applies at once.
 *
 * Mastra's logger is off: message content must not reach the logs.
 */
@Injectable()
export class MastraAgentRuntimeAdapter extends AgentRuntime {
  readonly #logger = new Logger(MastraAgentRuntimeAdapter.name);
  readonly #tools = new Map(
    TOOL_CATALOG.filter(tool => tool.exposure.agents).map(tool => [
      tool.id,
      tool,
    ]),
  );

  constructor(
    @Inject(AGENTS_OPTIONS)
    private readonly options: AgentsModuleOptions,
  ) {
    super();
  }

  public async stream(run: AgentRun): Promise<ReadableStream<Uint8Array>> {
    const caller: Caller = { accountId: run.accountId };
    const build = (profile: AgentProfile, agents?: Record<string, Agent>) =>
      new Agent({
        id: agentKey(profile),
        name: profile.name.value,
        description: profile.description.value,
        instructions: profile.instructions.value,
        model: openRouterModel(profile.model.value, run.apiKey.value),
        tools: this.toolsOf(profile, caller),
        ...(agents && Object.keys(agents).length > 0 ? { agents } : {}),
      });

    const specialists = Object.fromEntries(
      run.specialists.map(profile => [agentKey(profile), build(profile)]),
    );
    const orchestrator = build(run.orchestrator, specialists);
    const mastra = new Mastra({
      agents: { [orchestrator.id]: orchestrator },
      logger: false,
    });

    const stream = await handleChatStream({
      mastra,
      agentId: orchestrator.id,
      version: 'v7',
      params: {
        messages: run.request.messages as never,
        trigger: run.request.trigger,
        abortSignal: run.abortSignal,
        maxSteps: MAX_STEPS,
      },
      onError: error => {
        this.#logger.error(
          `Agent run failed in workspace ${run.orchestrator.workspaceId.value}`,
          error instanceof Error ? error.stack : String(error),
        );
        return describeFailure(error);
      },
    });

    return stream
      .pipeThrough(new JsonToSseTransformStream())
      .pipeThrough(new TextEncoderStream());
  }

  /** A tool removed from the catalog since is skipped, not an error. */
  private toolsOf(profile: AgentProfile, caller: Caller) {
    return Object.fromEntries(
      profile.tools
        .map(tool => this.#tools.get(tool.value))
        .filter((tool): tool is ToolDefinition => tool !== undefined)
        .map(tool => [tool.id, this.toMastraTool(tool, caller)]),
    );
  }

  private toMastraTool(tool: ToolDefinition, caller: Caller) {
    return createTool({
      id: tool.id,
      description: tool.description,
      inputSchema: tool.input,
      outputSchema: tool.output,
      execute: input => tool.run(this.options.toolApis, input, caller),
    });
  }
}
