import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  EditKnowledgeItemDto,
  KnowledgeApi,
  KnowledgeItemDto,
  KnowledgeItemPageDto,
  ListKnowledgeItemsDto,
  RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { AccessResolver } from '../../../tenancy/index.js';
import { KnowledgeKindMismatchException } from '../../domain/exceptions/index.js';
import {
  DraftDeletionService,
  DraftEditingService,
  KnowledgeRecordingService,
} from '../../domain/services/index.js';
import {
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeStatus,
} from '../../domain/value-objects/index.js';
import {
  toChangedKnowledgeContent,
  toKnowledgeContent,
  toKnowledgeItemDto,
} from '../mappers/index.js';
import {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from '../ports/outbound/index.js';

@Injectable()
export class KnowledgeService implements KnowledgeApi {
  readonly #knowledgeRecordingService = new KnowledgeRecordingService();
  readonly #draftEditingService = new DraftEditingService();
  readonly #draftDeletionService = new DraftDeletionService();

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
      const { member, project, projectRole } =
        await this.accessResolver.resolveInProject(
          actor,
          new WorkspaceId(workspaceId),
          new ProjectId(projectId),
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

      return toKnowledgeItemDto(item);
    });
  }

  public async list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto> {
    const { project } = await this.accessResolver.resolveInProject(
      actor,
      new WorkspaceId(workspaceId),
      new ProjectId(projectId),
    );
    const props = {
      projectId: project.id,
      ...(query.kind && { kind: KnowledgeKind.from(query.kind) }),
      ...(query.status && { status: KnowledgeStatus.from(query.status) }),
    };

    const items = await this.knowledgeItemRepository.findMany(props, {
      take: query.take,
      offset: query.offset,
    });
    const total = await this.knowledgeItemRepository.count(props);

    return { items: items.map(toKnowledgeItemDto), total };
  }

  public async get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeItemDto> {
    const { project } = await this.accessResolver.resolveInProject(
      actor,
      new WorkspaceId(workspaceId),
      new ProjectId(projectId),
    );
    const item = await this.knowledgeItemRepository.getOne({
      projectId: project.id,
      key: KnowledgeKey.parse(key),
    });

    return toKnowledgeItemDto(item);
  }

  public async edit(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } =
        await this.accessResolver.resolveInProject(
          actor,
          new WorkspaceId(workspaceId),
          new ProjectId(projectId),
        );
      const item = await this.knowledgeItemRepository.getOne({
        projectId: project.id,
        key: KnowledgeKey.parse(key),
      });
      if (!KnowledgeKind.from(data.kind).equals(item.kind)) {
        throw new KnowledgeKindMismatchException();
      }

      this.#draftEditingService.edit(member, projectRole, item, {
        title: data.title,
        rationale: data.rationale,
        content: toChangedKnowledgeContent(data),
      });
      await this.knowledgeItemRepository.save(item);

      return toKnowledgeItemDto(item);
    });
  }

  public async delete(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<void> {
    await this.unitOfWork.run(async () => {
      const { project, projectRole } =
        await this.accessResolver.resolveInProject(
          actor,
          new WorkspaceId(workspaceId),
          new ProjectId(projectId),
        );
      const item = await this.knowledgeItemRepository.getOne({
        projectId: project.id,
        key: KnowledgeKey.parse(key),
      });

      this.#draftDeletionService.ensureDeletable(projectRole, item);
      await this.knowledgeItemRepository.delete(item.id);
    });
  }
}
