import { Injectable } from '@nestjs/common';

import type {
  ApproveKnowledgeItemDto,
  ApproveKnowledgeItemsDto,
  CallerDto,
  ConfirmKnowledgeItemDto,
  DeleteKnowledgeItemDto,
  EditKnowledgeItemDto,
  KnowledgeApi,
  KnowledgeDependenciesDto,
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
  KnowledgeConfirmationService,
  KnowledgeRecordingService,
  KnowledgeRetirementService,
  ReviewMarkingService,
} from '../../domain/services/index.js';
import {
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  KnowledgeStatus,
} from '../../domain/value-objects/index.js';
import {
  toChangedKnowledgeContent,
  toKnowledgeAccessDto,
  toKnowledgeContent,
  toKnowledgeDependencyDto,
  toKnowledgeItemDto,
} from '../mappers/index.js';
import {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from '../ports/outbound/index.js';

/** What a list shows unless asked for a status: Rejected and Obsolete are not part of the knowledge. */
const LISTED_BY_DEFAULT: readonly KnowledgeStatus[] = [
  KnowledgeStatus.Draft,
  KnowledgeStatus.Approved,
];

/** The statuses whose items can still be marked or block a Deletion. */
const CURRENT: readonly KnowledgeStatus[] = [
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
  readonly #knowledgeConfirmationService = new KnowledgeConfirmationService();
  readonly #reviewMarkingService = new ReviewMarkingService();

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
      const links = data.links.map(link => KnowledgeLink.from(link));
      const replaced =
        data.supersedes === null
          ? null
          : await this.getItem(project.id, data.supersedes);
      const linkTargets = await this.findTargets(project.id, links);
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
          links,
          linkTargets,
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
      ...(query.needsReview !== undefined && {
        needsReview: query.needsReview,
      }),
    };

    const items = await this.knowledgeItemRepository.findMany(props, {
      take: query.take,
      offset: query.offset,
    });
    const total = await this.knowledgeItemRepository.count(props);
    const answers = await this.findAnswers(project.id, items);

    return {
      items: items.map(item =>
        toKnowledgeItemDto(item, projectRole, {
          answeredBy: answeredBy(item, answers),
        }),
      ),
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
    const answers = await this.findAnswers(project.id, [item]);
    const cascade = await this.findDependencyCascade(project.id, item);

    return toKnowledgeItemDto(item, projectRole, {
      answeredBy: answeredBy(item, answers),
      dependencyNeedsReview: cascade.items.some(
        dependency => dependency !== item && dependency.needsReview(),
      ),
    });
  }

  public async dependencies(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeDependenciesDto> {
    const { project, projectRole } = await this.resolve(
      caller,
      workspaceId,
      projectId,
    );
    const item = await this.getItem(project.id, key);
    const cascade = await this.findDependencyCascade(project.id, item);

    return {
      items: cascade.items.map(dependency =>
        toKnowledgeDependencyDto(dependency, projectRole),
      ),
      links: cascade.links.map(({ from, to }) => ({
        from: from.value,
        to: to.value,
      })),
    };
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
      const links = data.links?.map(link => KnowledgeLink.from(link));
      const linkTargets = await this.findTargets(project.id, links ?? []);

      this.#draftEditingService.edit(
        member,
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        {
          title: data.title,
          rationale: data.rationale,
          content: toChangedKnowledgeContent(data),
          links,
        },
        linkTargets,
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
      const linkingItems = await this.knowledgeItemRepository.findMany({
        projectId: project.id,
        linkingTo: { keys: [item.key] },
        statuses: CURRENT,
      });

      this.#draftDeletionService.ensureDeletable(
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        linkingItems,
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
    const [approved] = await this.approveTogether(
      caller,
      workspaceId,
      projectId,
      { items: [{ key, version: data.version }] },
    );

    return approved as KnowledgeItemDto;
  }

  public async approveTogether(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    data: ApproveKnowledgeItemsDto,
  ): Promise<KnowledgeItemDto[]> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const drafts = await Promise.all(
        data.items.map(async ({ key, version }) => ({
          item: await this.getItem(project.id, key),
          seenVersion: new KnowledgeItemVersion(version),
        })),
      );
      const related = await this.knowledgeItemRepository.findMany({
        projectId: project.id,
        keys: drafts.flatMap(({ item }) => [
          ...item.dependencies(),
          ...(item.supersedes ? [item.supersedes] : []),
        ]),
      });
      const approvedProductOverview = drafts.some(({ item }) =>
        item.kind.equals(KnowledgeKind.ProductOverview),
      )
        ? await this.knowledgeItemRepository.findOne({
            projectId: project.id,
            kind: KnowledgeKind.ProductOverview,
            statuses: [KnowledgeStatus.Approved],
          })
        : null;

      const superseded = this.#draftApprovalService.approve(
        member,
        projectRole,
        drafts,
        {
          find: key => related.find(item => item.key.equals(key)) ?? null,
          approvedProductOverview,
        },
      );
      const approved = drafts.map(({ item }) => item);
      const marked = await this.markSourcesOf(project.id, superseded, approved);
      // The replaced items first: a Project's one-Approved rules are unique
      // indexes, checked write by write even inside the transaction.
      await this.saveAll([...superseded, ...approved, ...marked]);

      return approved.map(item => toKnowledgeItemDto(item, projectRole));
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
      const marked = await this.markSourcesOf(project.id, [item], [item]);
      await this.saveAll([item, ...marked]);

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
      const marked = await this.markSourcesOf(project.id, [item], [item]);
      await this.saveAll([item, ...marked]);

      return toKnowledgeItemDto(item, projectRole);
    });
  }

  public async confirm(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: ConfirmKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { project, projectRole } = await this.resolve(
        caller,
        workspaceId,
        projectId,
      );
      const item = await this.getItem(project.id, key);
      const causes = await this.knowledgeItemRepository.findMany({
        projectId: project.id,
        keys: item.reviewCauses,
      });

      this.#knowledgeConfirmationService.confirm(
        projectRole,
        item,
        new KnowledgeItemVersion(data.version),
        causes,
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

  private findTargets(
    projectId: ProjectId,
    links: readonly KnowledgeLink[],
  ): Promise<KnowledgeItem[]> {
    return this.knowledgeItemRepository.findMany({
      projectId,
      keys: links.map(link => link.target),
    });
  }

  /** The Approved items answering the Open Questions among the given ones. */
  private findAnswers(
    projectId: ProjectId,
    items: readonly KnowledgeItem[],
  ): Promise<KnowledgeItem[]> {
    const questions = items
      .filter(item => item.kind.equals(KnowledgeKind.OpenQuestion))
      .map(item => item.key);

    return this.knowledgeItemRepository.findMany({
      projectId,
      linkingTo: { keys: questions, types: [KnowledgeLinkType.Answers] },
      statuses: [KnowledgeStatus.Approved],
    });
  }

  /**
   * Walks `depends on` from the item, level by level, each item once, so that
   * cycles end: the item itself first, then everything it reaches.
   */
  private async findDependencyCascade(
    projectId: ProjectId,
    root: KnowledgeItem,
  ): Promise<DependencyCascade> {
    const items = [root];
    const links: DependencyCascade['links'][number][] = [];
    let level = [root];
    while (level.length > 0) {
      const edges = level.flatMap(item =>
        item.dependencies().map(to => ({ from: item.key, to })),
      );
      links.push(...edges);
      const unseen = edges
        .map(({ to }) => to)
        .filter(
          (key, index, keys) =>
            keys.findIndex(other => other.equals(key)) === index &&
            !items.some(item => item.key.equals(key)),
        );
      level = await this.knowledgeItemRepository.findMany({
        projectId,
        keys: unseen,
      });
      items.push(...level);
    }

    return { items, links };
  }

  /**
   * Marks the current items that rest on the changed ones. An item already in
   * hand is marked as that same object, so that no copy overwrites it.
   */
  private async markSourcesOf(
    projectId: ProjectId,
    changed: readonly KnowledgeItem[],
    inHand: readonly KnowledgeItem[],
  ): Promise<KnowledgeItem[]> {
    const sources = await this.knowledgeItemRepository.findMany({
      projectId,
      linkingTo: {
        keys: changed.map(item => item.key),
        types: KnowledgeLinkType.MarkingForReview,
      },
      statuses: CURRENT,
    });
    const marked = sources.map(
      source => inHand.find(item => item.key.equals(source.key)) ?? source,
    );
    for (const item of changed) {
      this.#reviewMarkingService.markSources(item, marked);
    }

    return marked;
  }

  /** Saves each item once, in the given order. */
  private async saveAll(items: readonly KnowledgeItem[]): Promise<void> {
    const saved = new Set<KnowledgeItem>();
    for (const item of items) {
      if (!saved.has(item)) {
        saved.add(item);
        await this.knowledgeItemRepository.save(item);
      }
    }
  }
}

type DependencyCascade = {
  readonly items: KnowledgeItem[];
  readonly links: { readonly from: KnowledgeKey; readonly to: KnowledgeKey }[];
};

function answeredBy(
  question: KnowledgeItem,
  answers: readonly KnowledgeItem[],
): string[] {
  return answers
    .filter(answer =>
      answer.links.some(
        link =>
          link.type.equals(KnowledgeLinkType.Answers) &&
          link.target.equals(question.key),
      ),
    )
    .map(answer => answer.key.value);
}
