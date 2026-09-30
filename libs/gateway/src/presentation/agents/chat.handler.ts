import type { ServerResponse } from 'node:http';

import { RequestContext } from '@mastra/core/request-context';
import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  AGENT_FAILED,
  createOrchestrator,
  toChatEvent,
  type Orchestrator,
  type OrchestratorContext,
  type ToolApis,
} from '@intentra/agent-toolkit';
import { IamApi, type Actor } from '@intentra/contracts/iam';
import {
  ProjectRoleDtoSchema,
  WorkspaceApi,
  type ChatEventDto,
  type ChatMessageDto,
} from '@intentra/contracts/workspace';

import {
  GATEWAY_OPTIONS,
  type GatewayModuleOptions,
} from '../../gateway.options.js';
import { AgentNotConfiguredException } from '../rest/errors/index.js';

/** Enough for a few rounds of looking up, recording and answering. */
const MAX_STEPS = 10;

/** Who talks with the Orchestrator, and where. */
export type ChatScope = {
  readonly actor: Actor;
  readonly workspaceId: string;
  readonly project: OrchestratorContext['project'];
};

/**
 * Runs the Orchestrator for one Member in one Project and streams its answer
 * as server-sent events, one `ChatEventDto` each.
 */
@Injectable()
export class ChatHandler {
  readonly #logger = new Logger(ChatHandler.name);
  readonly #apis: ToolApis;
  readonly #orchestrator: Orchestrator | null;

  constructor(
    @Inject(IamApi) iam: IamApi,
    @Inject(WorkspaceApi) workspace: WorkspaceApi,
    @Inject(GATEWAY_OPTIONS) { agentModel }: GatewayModuleOptions,
  ) {
    this.#apis = { iam, workspace };
    this.#orchestrator = agentModel
      ? createOrchestrator({
          model: agentModel,
          onUnexpectedError: error => this.#logger.error(error),
        })
      : null;
  }

  public async handle(
    { actor, workspaceId, project }: ChatScope,
    messages: readonly ChatMessageDto[],
    res: ServerResponse,
  ): Promise<void> {
    if (!this.#orchestrator) {
      throw new AgentNotConfiguredException();
    }

    const requestContext = new RequestContext<OrchestratorContext>();
    requestContext.set('apis', this.#apis);
    // The Orchestrator gets the lower of Contributor and the Member's Project
    // Role: it records and edits Drafts, never approves. Knowledge then shows
    // Source `external-agent`, a known gap until Source knows Intentra's own Agents.
    requestContext.set('caller', {
      actor,
      agent: { level: ProjectRoleDtoSchema.enum.contributor },
    });
    requestContext.set('workspaceId', workspaceId);
    requestContext.set('project', project);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    // The response, not the request: a request closes once its body is read.
    const abort = new AbortController();
    res.on('close', () => abort.abort());
    const send = (event: ChatEventDto): void => {
      if (!res.writableEnded && !res.destroyed) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    try {
      // Narrowed one role at a time, as Mastra's message types want.
      const conversation = messages.map(({ role, content }) =>
        role === 'user' ? { role, content } : { role, content },
      );
      const output = await this.#orchestrator.stream(conversation, {
        requestContext,
        maxSteps: MAX_STEPS,
        abortSignal: abort.signal,
      });
      for await (const chunk of output.fullStream) {
        if (abort.signal.aborted) break;
        if (chunk.type === 'error') {
          this.#logger.error(chunk.payload.error);
        }
        const event = toChatEvent(chunk);
        if (!event) continue;
        send(event);
        if (event.type === 'error') break;
      }
    } catch (error) {
      // A client that went away is no failure.
      if (!abort.signal.aborted) {
        this.#logger.error(error);
        send(AGENT_FAILED);
      }
    } finally {
      abort.abort();
      res.end();
    }
  }
}
