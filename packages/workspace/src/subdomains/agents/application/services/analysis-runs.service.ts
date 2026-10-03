import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  AnalysisScheduleBlockDtoSchema,
  type AnalysisRunDto,
  type AnalysisRunPageDto,
  type AnalysisRunsApi,
  type AnalysisScheduleBlockDto,
  type AnalysisScheduleDto,
  type ChangeAnalysisScheduleDto,
  type ListAnalysisRunsDto,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  ProjectRepository,
  WorkspaceRepository,
  type Project,
  type ProjectMembership,
} from '../../../tenancy/index.js';
import { AnalysisRun, AnalysisSchedule } from '../../domain/entities/index.js';
import {
  AnalysisRunForbiddenException,
  AnalysisScheduleForbiddenException,
} from '../../domain/exceptions/index.js';
import { AnalysisRunPolicyService } from '../../domain/services/index.js';
import {
  AnalysisRunFailure,
  AnalysisRunId,
  AnalysisRunScope,
  AnalysisRunStatus,
} from '../../domain/value-objects/index.js';
import { AnalysisRunBusyException } from '../exceptions/index.js';
import { toAnalysisRunDto } from '../mappers/index.js';
import { toIsoString } from '../mappers/instant.mapper.js';
import {
  AgentsVersionRepository,
  AnalysisRunRepository,
  AnalysisScheduleRepository,
  Auditor,
  KnowledgeChangesReader,
  ProviderKeyCipher,
  ProviderKeyRepository,
  type KnowledgeChanges,
} from '../ports/outbound/index.js';

/**
 * A Project's Analysis Runs and its nightly schedule. A run started here goes
 * on in the background in this process, on the Published Agents' Auditor; one
 * left running when the process stopped is marked interrupted when it starts
 * again. The nightly runs go one Project after another.
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
    private readonly analysisScheduleRepository: AnalysisScheduleRepository,
    private readonly agentsVersionRepository: AgentsVersionRepository,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly providerKeyCipher: ProviderKeyCipher,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly knowledgeChangesReader: KnowledgeChangesReader,
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
    void this.carryOut(run.run, run.project, null);

    return toAnalysisRunDto(run.run);
  }

  public async schedule(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<AnalysisScheduleDto> {
    const { project, projectRole } = await this.resolve(
      actor,
      workspaceId,
      projectId,
    );
    const schedule = await this.analysisScheduleRepository.findOne({
      projectId: project.id,
    });

    return this.toScheduleDto(
      schedule,
      project,
      this.#analysisRunPolicyService.canChangeSchedule(projectRole),
    );
  }

  public async changeSchedule(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: ChangeAnalysisScheduleDto,
  ): Promise<AnalysisScheduleDto> {
    const { schedule, project } = await this.unitOfWork.run(async () => {
      const { member, project, projectRole } =
        await this.accessResolver.resolveInProjectForChange(
          { actor, agent: null },
          new WorkspaceId(workspaceId),
          new ProjectId(projectId),
        );
      if (!this.#analysisRunPolicyService.canChangeSchedule(projectRole)) {
        throw new AnalysisScheduleForbiddenException();
      }
      const found = await this.analysisScheduleRepository.findOne({
        projectId: project.id,
      });
      const schedule =
        found ??
        AnalysisSchedule.create({
          workspaceId: project.workspaceId.value,
          projectId: project.id.value,
          enabled: data.enabled,
          changedBy: member.id.value,
        });
      schedule.turn(data.enabled, member.id);
      await this.analysisScheduleRepository.save(schedule);

      return { schedule, project };
    });

    return this.toScheduleDto(schedule, project, true);
  }

  /**
   * The nightly runs: each Project whose schedule is on, one after another,
   * over what was approved or retired since its last completed run (the whole
   * Project if it has none). A Project is left alone, with nothing kept, when
   * its Workspace is suspended, a run cannot go ahead (no Provider Key, no
   * Published Agents), one is already running, or nothing changed.
   */
  public async runScheduled(): Promise<void> {
    const schedules = await this.analysisScheduleRepository.findMany({
      enabled: true,
    });
    for (const schedule of schedules) {
      try {
        await this.runScheduledFor(schedule);
      } catch (error) {
        this.#logger.error(error);
      }
    }
  }

  private async runScheduledFor(schedule: AnalysisSchedule): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      id: schedule.workspaceId,
    });
    const project = await this.projectRepository.findOne({
      workspaceId: schedule.workspaceId,
      id: schedule.projectId,
    });
    if (
      !workspace ||
      workspace.isSuspended ||
      !project ||
      (await this.blockerOf(project)) !== null
    ) {
      return;
    }
    const [lastCompleted] = await this.analysisRunRepository.findMany(
      { projectId: project.id, status: AnalysisRunStatus.Completed },
      { take: 1, offset: 0 },
    );
    const changes = lastCompleted
      ? await this.knowledgeChangesReader.since(
          project,
          lastCompleted.startedAt,
        )
      : null;
    if (
      changes &&
      changes.approved.length === 0 &&
      changes.retired.length === 0
    ) {
      return;
    }
    const run = AnalysisRun.start({
      workspaceId: project.workspaceId.value,
      projectId: project.id.value,
      scope: changes ? AnalysisRunScope.Changes : AnalysisRunScope.WholeProject,
      changedKeys: changes ? [...changes.approved, ...changes.retired] : [],
      startedBy: null,
    });
    try {
      await this.keep(run);
    } catch (error) {
      if (error instanceof AnalysisRunBusyException) {
        return;
      }
      throw error;
    }
    await this.carryOut(run, project, changes);
  }

  /** What keeps a run from going ahead in the Project now; null when nothing does. */
  private async blockerOf(
    project: Project,
  ): Promise<AnalysisScheduleBlockDto | null> {
    const providerKey = await this.providerKeyRepository.findOne({
      workspaceId: project.workspaceId,
    });
    if (!providerKey) {
      return AnalysisScheduleBlockDtoSchema.enum['provider-key-missing'];
    }
    // Counted, not read: telling the schedule's state never depends on what the Agents hold.
    const published = await this.agentsVersionRepository.count();

    return published > 0
      ? null
      : AnalysisScheduleBlockDtoSchema.enum['agents-not-published'];
  }

  private async toScheduleDto(
    schedule: AnalysisSchedule | null,
    project: Project,
    canChange: boolean,
  ): Promise<AnalysisScheduleDto> {
    const enabled = schedule?.enabled ?? false;

    return {
      enabled,
      changedBy: schedule?.changedBy.value ?? null,
      changedAt: schedule ? toIsoString(schedule.changedAt) : null,
      blockedBy: enabled ? await this.blockerOf(project) : null,
      access: { canChange },
    };
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
  private async carryOut(
    run: AnalysisRun,
    project: Project,
    changes: KnowledgeChanges | null,
  ): Promise<void> {
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
        changes,
        agents: published.content,
        providerKey: this.providerKeyCipher.decrypt(providerKey.encryptedKey),
      });
      if (result.failure) {
        run.fail(result.failure, result.questionKeys);
      } else {
        run.complete(result);
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
