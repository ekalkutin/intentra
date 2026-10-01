import { randomUUID } from 'node:crypto';

import { toAISdkStream } from '@mastra/ai-sdk';
import { ErrorDomain } from '@mastra/core/error';
import { RequestContext } from '@mastra/core/request-context';
import { Memory } from '@mastra/memory';
import { Inject, Injectable, Logger, type Provider } from '@nestjs/common';

import {
  createOrchestrator,
  type AgentDefinition,
  type OrchestratorContext,
  type ToolApis,
} from '@intentra/agent-toolkit';
import {
  AgentKindDtoSchema,
  AGENTS_IN_USE_CHUNK_TYPE,
  ProjectRoleDtoSchema,
  type AgentsInUseDto,
  type ProjectRoleDto,
  type ReasoningEffortDto,
} from '@intentra/contracts/workspace';

import { KnowledgeService } from '../../../../knowledge/index.js';
import { AccessService, ProjectsService } from '../../../../tenancy/index.js';
import {
  Orchestrator,
  type AnswerStream,
  type OrchestratorAnswer,
  type OrchestratorQuestion,
} from '../../../application/ports/outbound/index.js';
import type { Agent, AgentsContent } from '../../../domain/entities/index.js';
import type { ProviderKeySecret } from '../../../domain/value-objects/index.js';
import { AGENTS_OPTIONS, type AgentsOptions } from '../../runtime/index.js';

/** What the client is told when the Orchestrator itself fails; the cause stays in the logs. */
const AGENT_FAILED = 'The Orchestrator could not answer. Try again later';

/**
 * Runs the Orchestrator and its Specialists from `@intentra/agent-toolkit`,
 * built for each answer from the Agents given, each on its Model Profile and
 * the Workspace's Provider Key. Their tools call back into Knowledge, Projects and Access through
 * their published sub-APIs, as an external agent does over MCP (Agents ADR
 * 0002).
 */
@Injectable()
export class OrchestratorAdapter implements Orchestrator {
  readonly #logger = new Logger(OrchestratorAdapter.name);
  readonly #apis: ToolApis;

  constructor(
    @Inject(AGENTS_OPTIONS) private readonly options: AgentsOptions,
    private readonly memory: Memory,
    knowledgeService: KnowledgeService,
    projectsService: ProjectsService,
    accessService: AccessService,
  ) {
    this.#apis = {
      knowledge: knowledgeService,
      projects: projectsService,
      access: accessService,
    };
  }

  public async answer({
    conversation,
    actor,
    project,
    projectRole,
    message,
    providerKey,
    agents,
    agentsVersion,
  }: OrchestratorQuestion): Promise<OrchestratorAnswer> {
    const orchestratorAgent = agents.orchestrator();
    if (!orchestratorAgent) {
      throw new Error('The Agents to run hold no Orchestrator');
    }
    const orchestrator = createOrchestrator({
      orchestrator: this.toDefinition(agents, orchestratorAgent, providerKey),
      specialists: agents
        .specialistsOf(orchestratorAgent)
        .map(specialist => this.toDefinition(agents, specialist, providerKey)),
      memory: this.memory,
      onUnexpectedError: error => this.#logger.error(error),
    });
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

    const output = await orchestrator.stream(
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

    const agentsInUse: AgentsInUseDto = {
      versionNumber: agentsVersion?.value ?? null,
    };

    return {
      stream: prepend(stream as unknown as AnswerStream, {
        type: AGENTS_IN_USE_CHUNK_TYPE,
        data: agentsInUse,
        transient: true,
      }),
      done,
    };
  }

  private toDefinition(
    agents: AgentsContent,
    agent: Agent,
    providerKey: ProviderKeySecret,
  ): AgentDefinition {
    const profile = agents.modelProfileOf(agent);
    if (!profile) {
      throw new Error(`${agent.name.value} is on no Model Profile`);
    }

    return {
      name: agent.name.value,
      description: agent.description.value,
      instructions: agent.instructions.value,
      toolIds: agent.tools.map(tool => tool.value),
      skills: agents.skillsOf(agent).map(skill => ({
        name: skill.name.value,
        description: skill.description.value,
        instructions: skill.instructions.value,
      })),
      model: this.options.model(profile.modelId.value, providerKey.value),
      temperature: profile.temperature?.value ?? null,
      reasoningEffort: (profile.reasoningEffort?.value ??
        null) as ReasoningEffortDto | null,
      maxOutputTokens: profile.maxOutputTokens?.value ?? null,
    };
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

/** The stream with `chunk` first. */
function prepend(
  stream: AnswerStream,
  chunk: AnswerStream extends ReadableStream<infer T> ? T : never,
): AnswerStream {
  return stream.pipeThrough(
    new TransformStream({
      start: controller => controller.enqueue(chunk),
    }),
  );
}

export const ORCHESTRATOR_PROVIDER: Provider = {
  provide: Orchestrator,
  useClass: OrchestratorAdapter,
};
