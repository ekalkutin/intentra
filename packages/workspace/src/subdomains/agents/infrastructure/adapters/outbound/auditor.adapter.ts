import { RequestContext } from '@mastra/core/request-context';
import { Inject, Injectable, Logger, type Provider } from '@nestjs/common';

import {
  AUDIT_TASKS,
  createAuditor,
  type AuditorContext,
  type ToolApis,
} from '@intentra/agent-toolkit';
import {
  intentraCaller,
  type KnowledgeApi,
} from '@intentra/contracts/workspace';

import { KnowledgeService } from '../../../../knowledge/index.js';
import { AccessService, ProjectsService } from '../../../../tenancy/index.js';
import {
  Auditor,
  type AuditResult,
  type AuditTask,
} from '../../../application/ports/outbound/index.js';
import {
  AGENTS_OPTIONS,
  toAgentDefinition,
  type AgentsOptions,
} from '../../runtime/index.js';

/**
 * Runs the Auditor from `@intentra/agent-toolkit` on the Agents given, its
 * Model Profile and the Workspace's Provider Key. Its tools call back into
 * Knowledge through the published sub-APIs as Intentra itself, which may
 * only read and record Open Questions (Agents ADR 0004).
 */
@Injectable()
export class AuditorAdapter implements Auditor {
  readonly #logger = new Logger(AuditorAdapter.name);

  constructor(
    @Inject(AGENTS_OPTIONS) private readonly options: AgentsOptions,
    private readonly knowledgeService: KnowledgeService,
    private readonly projectsService: ProjectsService,
    private readonly accessService: AccessService,
  ) {}

  public async audit({
    project,
    agents,
    providerKey,
  }: AuditTask): Promise<AuditResult> {
    const questionKeys: string[] = [];
    try {
      const auditorAgent = agents.auditor();
      if (!auditorAgent) {
        throw new Error('The Agents to run hold no Auditor');
      }
      const auditor = createAuditor({
        auditor: toAgentDefinition(
          this.options,
          agents,
          auditorAgent,
          providerKey,
        ),
        onUnexpectedError: error => this.#logger.error(error),
      });
      const apis: ToolApis = {
        knowledge: recordingKeys(this.knowledgeService, questionKeys),
        projects: this.projectsService,
        access: this.accessService,
      };
      const requestContext = new RequestContext<AuditorContext>();
      requestContext.set('apis', apis);
      requestContext.set('caller', intentraCaller(project.id.value));
      requestContext.set('workspaceId', project.workspaceId.value);
      requestContext.set('project', {
        id: project.id.value,
        name: project.name.value,
      });

      const output = await auditor.generate(AUDIT_TASKS.wholeProject, {
        requestContext,
        maxSteps: this.options.auditMaxSteps,
        abortSignal: AbortSignal.timeout(this.options.auditTimeoutMs),
      });
      if (output.error) {
        throw output.error;
      }

      return {
        succeeded: true,
        questionKeys,
        stepLimitReached: output.steps.length >= this.options.auditMaxSteps,
      };
    } catch (error) {
      this.#logger.error(error);

      return { succeeded: false, questionKeys, stepLimitReached: false };
    }
  }
}

/** The Knowledge API as it is, noting the key of every item recorded through it. */
function recordingKeys(knowledge: KnowledgeApi, keys: string[]): KnowledgeApi {
  return new Proxy(knowledge, {
    get(target, property) {
      const value: unknown = Reflect.get(target, property, target);
      if (property === 'record') {
        return async (...args: Parameters<KnowledgeApi['record']>) => {
          const item = await target.record(...args);
          keys.push(item.key);

          return item;
        };
      }

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export const AUDITOR_PROVIDER: Provider = {
  provide: Auditor,
  useClass: AuditorAdapter,
};
