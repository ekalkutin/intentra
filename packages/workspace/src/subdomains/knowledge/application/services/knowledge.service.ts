import { Injectable } from '@nestjs/common';

import type {
  ApproveKnowledgeItemDto,
  CallerDto,
  DeleteKnowledgeItemDto,
  EditKnowledgeItemDto,
  KnowledgeApi,
  KnowledgeItemDto,
  KnowledgeItemPageDto,
  ListKnowledgeItemsDto,
  RecordKnowledgeItemDto,
  RejectKnowledgeItemDto,
  RetireKnowledgeItemDto,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  type ProjectMembership,
} from '../../../tenancy/index.js';
import { KnowledgeItem } from '../../domain/entities/index.js';
import { KnowledgeKindMismatchException } from '../../domain/exceptions/index.js';
import {
  DraftApprovalService,
  DraftDeletionService,
  DraftEditingService,
  DraftRejectionService,
  KnowledgeRecordingService,
  KnowledgeRetirementService,
} from '../../domain/services/index.js';
import {
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeSource,
  KnowledgeStatus,
} from '../../domain/value-objects/index.js';
import {
  toChangedKnowledgeContent,
  toKnowledgeAccessDto,
  toKnowledgeContent,
  toKnowledgeItemDto,
} from '../mappers/index.js';
import {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from '../ports/outbound/index.js';

/** What a list shows unless asked for a status: Rejected is not part of the knowledge. */
const LISTED_BY_DEFAULT: readonly KnowledgeStatus[] = [
  KnowledgeStatus.Draft,
  KnowledgeStatus.Approved,
];

@Injectable()
export class KnowledgeService implements KnowledgeApi {
  readonly #knowledgeRecordingService = new KnowledgeRecordingService();
  readonly #draftEditingService = new DraftEditingService();
  readonly #draftDeletionService = new DraftDeletionService();
  readonly #draftApprovalService = new DraftApprovalService();
  readonly #draftRejectionService = new DraftRejectionService();
  readonly #knowledgeRetirementService = new KnowledgeRetirementService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly knowledgeItemRepository: KnowledgeItemRepository,
    private readonly knowledgeKeyCounter: KnowledgeKeyCounter,
  ) {}

  public async record(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    data: RecordKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const content = toKnowledgeContent(data);
      const replaced =
        data.supersedes === null
          ? null
          : await this.getItem(project.id, data.supersedes);
      const number = await this.knowledgeKeyCounter.next({
        workspaceId: project.workspaceId,
        projectId: project.id,
        kind: content.kind,
      });

      const item = this.#knowledgeRecordingService.record(
        project,
        member,
        projectRole,
        {
          source: caller.agent
            ? KnowledgeSource.ExternalAgent
            : KnowledgeSource.Manual,
          number,
          title: data.title,
          rationale: data.rationale,
          content,
          replaced,
        },
      );
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async list(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto> {
    const { project, projectRole } = await this.resolve(
      caller,
      workspaceId,
      projectId,
    );
    const props = {
      projectId: project.id,
      ...(query.kind && { kind: KnowledgeKind.from(query.kind) }),
      statuses: query.statuses
        ? query.statuses.map(status => KnowledgeStatus.from(status))
        : LISTED_BY_DEFAULT,
    };

    const items = await this.knowledgeItemRepository.findMany(props, {
      take: query.take,
      offset: query.offset,
    });
    const total = await this.knowledgeItemRepository.count(props);

    return {
      items: items.map(item => toKnowledgeItemDto(item, projectRole)),
      total,
      access: toKnowledgeAccessDto(projectRole),
    };
  }

  public async get(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeItemDto> {
    const { project, projectRole } = await this.resolve(
      caller,
      workspaceId,
      projectId,
    );
    const item = await this.getItem(project.id, key);

    return toKnowledgeItemDto(item, projectRole);
  }

  public async edit(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);
      if (!KnowledgeKind.from(data.kind).equals(item.kind)) {
        throw new KnowledgeKindMismatchException();
      }

      this.#draftEditingService.edit(
        member,
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        {
          title: data.title,
          rationale: data.rationale,
          content: toChangedKnowledgeContent(data),
        },
      );
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async delete(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: DeleteKnowledgeItemDto,
  ): Promise<void> {
    await this.unitOfWork.run(async () => {
      const { project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);

      this.#draftDeletionService.ensureDeletable(
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
      );
      await this.knowledgeItemRepository.delete(item.id);
    });
  }

  public async approve(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: ApproveKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);
      const replaced =
        item.supersedes &&
        (await this.knowledgeItemRepository.findOne({
          projectId: project.id,
          key: item.supersedes,
        }));
      const approvedProductOverview = item.kind.equals(
        KnowledgeKind.ProductOverview,
      )
        ? await this.knowledgeItemRepository.findOne({
            projectId: project.id,
            kind: KnowledgeKind.ProductOverview,
            statuses: [KnowledgeStatus.Approved],
          })
        : null;

      this.#draftApprovalService.approve(
        member,
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        { replaced, approvedProductOverview },
      );
      // The replaced item first: a Project's one-Approved rules are unique
      // indexes, checked write by write even inside the transaction.
      if (replaced) {
        await this.knowledgeItemRepository.save(replaced);
      }
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async reject(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: RejectKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);

      this.#draftRejectionService.reject(
        member,
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        data.reason,
      );
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async retire(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: RetireKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);

      this.#knowledgeRetirementService.retire(
        member,
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        data.reason,
      );
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  private resolve(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectMembership> {
    return this.accessResolver.resolveInProject(
      caller,
      new WorkspaceId(workspaceId),
      new ProjectId(projectId),
    );
  }

  private getItem(projectId: ProjectId, key: string): Promise<KnowledgeItem> {
    return this.knowledgeItemRepository.getOne({
      projectId,
      key: KnowledgeKey.parse(key),
    });
  }
}
