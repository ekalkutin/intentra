import { randomUUID } from 'node:crypto';

import { toAISdkStream } from '@mastra/ai-sdk';
import { ErrorDomain } from '@mastra/core/error';
import { RequestContext } from '@mastra/core/request-context';
import { Memory } from '@mastra/memory';
import { Inject, Injectable, Logger, type Provider } from '@nestjs/common';

import {
  createOrchestrator,
  type OrchestratorContext,
  type ToolApis,
} from '@intentra/agent-toolkit';
import {
  AgentKindDtoSchema,
  ProjectRoleDtoSchema,
  type ProjectRoleDto,
} from '@intentra/contracts/workspace';

import { KnowledgeService } from '../../../../knowledge/index.js';
import { AccessService, ProjectsService } from '../../../../tenancy/index.js';
import { AgentNotConfiguredException } from '../../../application/exceptions/index.js';
import {
  Orchestrator,
  type AnswerStream,
  type OrchestratorAnswer,
  type OrchestratorQuestion,
} from '../../../application/ports/outbound/index.js';
import { AGENTS_OPTIONS, type AgentsOptions } from '../../runtime/index.js';

/** What the client is told when the Orchestrator itself fails; the cause stays in the logs. */
const AGENT_FAILED = 'The Orchestrator could not answer. Try again later';

/**
 * Runs the Orchestrator from `@intentra/agent-toolkit` on the configured
 * model. Its tools call back into Knowledge, Projects and Access through
 * their published sub-APIs, as an external agent does over MCP (Agents ADR
 * 0002).
 */
@Injectable()
export class OrchestratorAdapter implements Orchestrator {
  readonly #logger = new Logger(OrchestratorAdapter.name);
  readonly #orchestrator: ReturnType<typeof createOrchestrator> | null;
  readonly #apis: ToolApis;

  constructor(
    @Inject(AGENTS_OPTIONS) private readonly options: AgentsOptions,
    memory: Memory,
    knowledgeService: KnowledgeService,
    projectsService: ProjectsService,
    accessService: AccessService,
  ) {
    this.#apis = {
      knowledge: knowledgeService,
      projects: projectsService,
      access: accessService,
    };
    this.#orchestrator = options.model
      ? createOrchestrator({
          model: options.model,
          memory,
          onUnexpectedError: error => this.#logger.error(error),
        })
      : null;
  }

  public isAvailable(): boolean {
    return this.#orchestrator !== null;
  }

  public async answer({
    conversation,
    actor,
    project,
    projectRole,
    message,
  }: OrchestratorQuestion): Promise<OrchestratorAnswer> {
    if (!this.#orchestrator) {
      throw new AgentNotConfiguredException();
    }
    const requestContext = new RequestContext<OrchestratorContext>();
    requestContext.set('apis', this.#apis);
    // At most a Contributor, and only in the Conversation's Project.
    requestContext.set('caller', {
      actor,
      agent: {
        kind: AgentKindDtoSchema.enum.intentra,
        level: ProjectRoleDtoSchema.enum.contributor,
        projectId: project.id.value,
      },
    });
    requestContext.set('workspaceId', project.workspaceId.value);
    requestContext.set('project', {
      id: project.id.value,
      name: project.name.value,
      role: projectRole.value as ProjectRoleDto,
    });

    const output = await this.#orchestrator.stream(
      [{ id: message.id ?? randomUUID(), role: 'user', parts: message.parts }],
      {
        requestContext,
        memory: {
          thread: conversation.id.value,
          resource: conversation.memberId.value,
        },
        maxSteps: this.options.maxSteps,
        abortSignal: AbortSignal.timeout(this.options.timeoutMs),
      },
    );
    // Runs the answer to the end even if nobody reads the stream.
    const done = output
      .consumeStream({ onError: error => this.#logger.error(error) })
      .catch(error => this.#logger.error(error));
    const stream = toAISdkStream(output, {
      from: 'agent',
      version: 'v7',
      onError: error => this.describeFailure(error),
    });

    return { stream: stream as unknown as AnswerStream, done };
  }

  /**
   * What the client is told of a failure. A tool's failure already reads
   * `CODE: message`, safe to show, as the model saw it; anything else stays
   * in the logs. Mastra hands a tool's failure over as a plain `Error` with
   * its `domain`, not as a `MastraError`.
   */
  private describeFailure(error: unknown): string {
    if (
      error instanceof Error &&
      'domain' in error &&
      error.domain === ErrorDomain.TOOL &&
      error.cause instanceof Error
    ) {
      return error.cause.message;
    }
    this.#logger.error(error);

    return AGENT_FAILED;
  }
}

export const ORCHESTRATOR_PROVIDER: Provider = {
  provide: Orchestrator,
  useClass: OrchestratorAdapter,
};
