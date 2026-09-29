import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  ApproveKnowledgeItemDto,
  DeleteKnowledgeItemDto,
  EditKnowledgeItemDto,
  KnowledgeApi,
  KnowledgeItemDto,
  KnowledgeItemPageDto,
  ListKnowledgeItemsDto,
  RecordKnowledgeItemDto,
  RejectKnowledgeItemDto,
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
} from '../../domain/services/index.js';
import {
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
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

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly knowledgeItemRepository: KnowledgeItemRepository,
    private readonly knowledgeKeyCounter: KnowledgeKeyCounter,
  ) {}

  public async record(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: RecordKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        actor,
        workspaceId,
        projectId,
      );
      const content = toKnowledgeContent(data);
      const number = await this.knowledgeKeyCounter.next({
        workspaceId: project.workspaceId,
        projectId: project.id,
        kind: content.kind,
      });

      const item = this.#knowledgeRecordingService.record(
        project,
        member,
        projectRole,
        { number, title: data.title, rationale: data.rationale, content },
      );
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto> {
    const { project, projectRole } = await this.resolve(
      actor,
      workspaceId,
      projectId,
    );
    const props = {
      projectId: project.id,
      ...(query.kind && { kind: KnowledgeKind.from(query.kind) }),
      statuses: query.status
        ? [KnowledgeStatus.from(query.status)]
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
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeItemDto> {
    const { project, projectRole } = await this.resolve(
      actor,
      workspaceId,
      projectId,
    );
    const item = await this.getItem(project.id, key);

    return toKnowledgeItemDto(item, projectRole);
  }

  public async edit(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        actor,
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
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: DeleteKnowledgeItemDto,
  ): Promise<void> {
    await this.unitOfWork.run(async () => {
      const { project, projectRole } = await this.resolve(
        actor,
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
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: ApproveKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        actor,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);

      this.#draftApprovalService.approve(
        member,
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
      );
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async reject(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: RejectKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        actor,
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

  private resolve(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectMembership> {
    return this.accessResolver.resolveInProject(
      actor,
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
