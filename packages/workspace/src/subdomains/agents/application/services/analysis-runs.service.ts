import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  AnalysisScheduleBlockDtoSchema,
  KnowledgeKindDtoSchema,
  type AnalysisRunDto,
  type AnalysisRunPageDto,
  type AnalysisRunsApi,
  type AnalysisScheduleBlockDto,
  type AnalysisScheduleDto,
  type ChangeAnalysisScheduleDto,
  type KnowledgeItemDto,
  type ListAnalysisRunsDto,
  type StartAnalysisRunDto,
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
  KnowledgeCheck,
} from '../../domain/value-objects/index.js';
import {
  AnalysisRunBusyException,
  ModelUnavailableException,
} from '../exceptions/index.js';
import { toAnalysisRunDto } from '../mappers/index.js';
import { toIsoString } from '../mappers/instant.mapper.js';
import {
  AgentsVersionRepository,
  AnalysisRunRepository,
  AnalysisScheduleRepository,
  AuditedKnowledge,
  Auditor,
  KnowledgeCheckRepository,
  ProviderKeyCipher,
  ProviderKeyRepository,
  type AuditJudgement,
} from '../ports/outbound/index.js';

import {
  concernedKeys,
  isAudited,
  isChecked,
  SIMILAR_TAKE,
  toAuditGroup,
} from './audit-plan.js';

/** How many items of a run are judged at once. */
const CONCURRENCY = 4;

/**
 * A Project's Analysis Runs and its nightly schedule. A run started here goes
 * on in the background in this process: it walks the Project's items and has
 * the Published Agents' Auditor judge each with the knowledge around it
 * (Agents ADR 0005). One left running when the process stopped is marked
 * interrupted when it starts again; what it looked at stays checked. The
 * nightly runs go one Project after another.
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
    private readonly auditedKnowledge: AuditedKnowledge,
    private readonly knowledgeCheckRepository: KnowledgeCheckRepository,
    private readonly auditor: Auditor,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.unitOfWork.run(async () => {
      const left = await this.analysisRunRepository.findMany({
        status: AnalysisRunStatus.Running,
      });
      for (const run of left) {
        run.fail(AnalysisRunFailure.Interrupted);
        await this.analysisRunRepository.save(run);
      }
    });
  }

  public async start(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: StartAnalysisRunDto,
  ): Promise<AnalysisRunDto> {
    const scope = AnalysisRunScope.from(data.scope);
    const run = await this.unitOfWork.run(async () => {
      const { member, project, projectRole } =
        await this.accessResolver.resolveInProjectForChange(
          { actor, agent: null },
          new WorkspaceId(workspaceId),
          new ProjectId(projectId),
        );
      const allowed = scope.equals(AnalysisRunScope.WholeProject)
        ? this.#analysisRunPolicyService.canStartWholeProject(projectRole)
        : this.#analysisRunPolicyService.canStart(projectRole);
      if (!allowed) {
        throw new AnalysisRunForbiddenException();
      }
      const started = AnalysisRun.start({
        workspaceId: project.workspaceId.value,
        projectId: project.id.value,
        scope,
        startedBy: member.id.value,
      });
      await this.analysisRunRepository.save(started);

      return { run: started, project };
    });
    void this.carryOut(run.run, run.project);

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
   * over its Unchecked items. A Project is left alone, with nothing kept, when
   * its Workspace is suspended, a run cannot go ahead (no Provider Key, no
   * Published Agents), one is already running, or nothing is Unchecked.
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
    const { checked, total } = await this.coverageOf(project);
    if (checked === total) {
      return;
    }
    const run = AnalysisRun.start({
      workspaceId: project.workspaceId.value,
      projectId: project.id.value,
      scope: AnalysisRunScope.Unchecked,
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
    await this.carryOut(run, project);
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
      coverage: await this.coverageOf(project),
      access: {
        canStart: this.#analysisRunPolicyService.canStart(projectRole),
        canStartWholeProject:
          this.#analysisRunPolicyService.canStartWholeProject(projectRole),
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

  /** How many of the Project's audited items are checked, of how many. */
  private async coverageOf(
    project: Project,
  ): Promise<{ checked: number; total: number }> {
    const items = (await this.auditedKnowledge.read(project)).filter(isAudited);
    const checks = await this.knowledgeCheckRepository.findMany({
      projectId: project.id,
    });

    return {
      checked: items.filter(item => isChecked(item, checks)).length,
      total: items.length,
    };
  }

  /**
   * Walks the run's items, a few at a time, has the Auditor judge each with
   * its group, records what it finds and marks the item checked; keeps what
   * came of it. Never rejects: a failure stops the run, and the items it did
   * not reach stay Unchecked.
   */
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
      const items = await this.auditedKnowledge.read(project);
      const checks = await this.knowledgeCheckRepository.findMany({
        projectId: project.id,
      });
      const targets = items
        .filter(isAudited)
        .filter(
          item =>
            run.scope.equals(AnalysisRunScope.WholeProject) ||
            !isChecked(item, checks),
        );
      run.runOn(published.number);
      run.plan(targets.length);
      await this.keep(run);

      const judgement = {
        project,
        agents: published.content,
        providerKey: this.providerKeyCipher.decrypt(providerKey.encryptedKey),
      };
      const questions = items.filter(
        item => item.kind === KnowledgeKindDtoSchema.enum['open-question'],
      );
      const queue = [...targets];
      await Promise.all(
        Array.from(
          { length: Math.min(CONCURRENCY, queue.length) },
          async () => {
            for (let item = queue.shift(); item; item = queue.shift()) {
              await this.checkOne(run, item, items, questions, judgement);
            }
          },
        ),
      );
      run.complete();
      await this.keep(run);
    } catch (error) {
      this.#logger.error(error);
      if (run.isRunning()) {
        run.fail(
          error instanceof ModelUnavailableException
            ? AnalysisRunFailure.ModelUnavailable
            : AnalysisRunFailure.AuditorFailed,
        );
        await this.keep(run).catch(failure => this.#logger.error(failure));
      }
    }
  }

  /** Judges one item, records the findings and marks it checked at the version read. */
  private async checkOne(
    run: AnalysisRun,
    item: KnowledgeItemDto,
    items: readonly KnowledgeItemDto[],
    questions: KnowledgeItemDto[],
    judgement: Omit<AuditJudgement, 'group'>,
  ): Promise<void> {
    if (!run.isRunning()) {
      return;
    }
    const { project } = judgement;
    const similar = await this.auditedKnowledge.similar(
      project,
      item.key,
      SIMILAR_TAKE,
    );
    const group = toAuditGroup(item, similar, items, questions);
    const findings = await this.auditor.judge({ ...judgement, group });
    if (!run.isRunning()) {
      return;
    }
    const recorded: string[] = [];
    for (const finding of findings) {
      const question = await this.auditedKnowledge.record(project, {
        ...finding,
        concerns: concernedKeys(group, finding.concerns),
      });
      questions.push(question);
      recorded.push(question.key);
    }
    await this.unitOfWork.run(() =>
      this.knowledgeCheckRepository.save(
        project.workspaceId,
        project.id,
        new KnowledgeCheck({
          key: item.key,
          version: item.version,
          checkedAt: Temporal.Now.instant(),
        }),
      ),
    );
    if (run.isRunning()) {
      run.checkOne(recorded);
      await this.keep(run);
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
