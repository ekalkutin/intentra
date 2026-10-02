import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  AnalysisRunDto,
  AnalysisRunPageDto,
  AnalysisRunsApi,
  ListAnalysisRunsDto,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  type Project,
  type ProjectMembership,
} from '../../../tenancy/index.js';
import { AnalysisRun } from '../../domain/entities/index.js';
import { AnalysisRunForbiddenException } from '../../domain/exceptions/index.js';
import { AnalysisRunPolicyService } from '../../domain/services/index.js';
import {
  AnalysisRunFailure,
  AnalysisRunId,
  AnalysisRunScope,
  AnalysisRunStatus,
} from '../../domain/value-objects/index.js';
import { toAnalysisRunDto } from '../mappers/index.js';
import {
  AgentsVersionRepository,
  AnalysisRunRepository,
  Auditor,
  ProviderKeyCipher,
  ProviderKeyRepository,
} from '../ports/outbound/index.js';

/**
 * A Project's Analysis Runs. A run started here goes on in the background in
 * this process, on the Published Agents' Auditor; one left running when the
 * process stopped is marked interrupted when it starts again.
 */
@Injectable()
export class AnalysisRunsService
  implements AnalysisRunsApi, OnApplicationBootstrap
{
  readonly #logger = new Logger(AnalysisRunsService.name);
  readonly #analysisRunPolicyService = new AnalysisRunPolicyService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly analysisRunRepository: AnalysisRunRepository,
    private readonly agentsVersionRepository: AgentsVersionRepository,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly providerKeyCipher: ProviderKeyCipher,
    private readonly auditor: Auditor,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.unitOfWork.run(async () => {
      const left = await this.analysisRunRepository.findMany({
        status: AnalysisRunStatus.Running,
      });
      for (const run of left) {
        run.fail(AnalysisRunFailure.Interrupted, run.questionKeys);
        await this.analysisRunRepository.save(run);
      }
    });
  }

  public async start(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<AnalysisRunDto> {
    const run = await this.unitOfWork.run(async () => {
      const { member, project, projectRole } =
        await this.accessResolver.resolveInProjectForChange(
          { actor, agent: null },
          new WorkspaceId(workspaceId),
          new ProjectId(projectId),
        );
      if (!this.#analysisRunPolicyService.canStart(projectRole)) {
        throw new AnalysisRunForbiddenException();
      }
      const started = AnalysisRun.start({
        workspaceId: project.workspaceId.value,
        projectId: project.id.value,
        scope: AnalysisRunScope.WholeProject,
        startedBy: member.id.value,
      });
      await this.analysisRunRepository.save(started);

      return { run: started, project };
    });
    void this.carryOut(run.run, run.project);

    return toAnalysisRunDto(run.run);
  }

  public async list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListAnalysisRunsDto,
  ): Promise<AnalysisRunPageDto> {
    const { project, projectRole } = await this.resolve(
      actor,
      workspaceId,
      projectId,
    );
    const props = { projectId: project.id };
    const runs = await this.analysisRunRepository.findMany(props, {
      take: query.take,
      offset: query.offset,
    });

    return {
      items: runs.map(toAnalysisRunDto),
      total: await this.analysisRunRepository.count(props),
      access: {
        canStart: this.#analysisRunPolicyService.canStart(projectRole),
      },
    };
  }

  public async get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    runId: string,
  ): Promise<AnalysisRunDto> {
    const { project } = await this.resolve(actor, workspaceId, projectId);
    const run = await this.analysisRunRepository.getOne({
      id: new AnalysisRunId(runId),
      projectId: project.id,
    });

    return toAnalysisRunDto(run);
  }

  /** Runs the Auditor and keeps what came of it; never rejects. */
  private async carryOut(run: AnalysisRun, project: Project): Promise<void> {
    try {
      const providerKey = await this.providerKeyRepository.findOne({
        workspaceId: project.workspaceId,
      });
      if (!providerKey) {
        run.fail(AnalysisRunFailure.ProviderKeyMissing);
        return await this.keep(run);
      }
      const published = await this.agentsVersionRepository.findOne({
        latest: true,
      });
      if (!published) {
        run.fail(AnalysisRunFailure.AgentsNotPublished);
        return await this.keep(run);
      }
      run.runOn(published.number);
      await this.keep(run);

      const result = await this.auditor.audit({
        project,
        scope: run.scope,
        agents: published.content,
        providerKey: this.providerKeyCipher.decrypt(providerKey.encryptedKey),
      });
      if (result.succeeded) {
        run.complete(result);
      } else {
        run.fail(AnalysisRunFailure.AuditorFailed, result.questionKeys);
      }
      await this.keep(run);
    } catch (error) {
      this.#logger.error(error);
      if (run.isRunning()) {
        run.fail(AnalysisRunFailure.AuditorFailed, run.questionKeys);
        await this.keep(run).catch(failure => this.#logger.error(failure));
      }
    }
  }

  private keep(run: AnalysisRun): Promise<void> {
    return this.unitOfWork.run(() => this.analysisRunRepository.save(run));
  }

  private resolve(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectMembership> {
    return this.accessResolver.resolveInProject(
      { actor, agent: null },
      new WorkspaceId(workspaceId),
      new ProjectId(projectId),
    );
  }
}
