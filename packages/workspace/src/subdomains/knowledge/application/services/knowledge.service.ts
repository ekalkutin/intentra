import { Injectable } from '@nestjs/common';

import {
  KnowledgeListOrderDtoSchema,
  type ApproveKnowledgeItemDto,
  type ApproveKnowledgeItemsDto,
  type CallerDto,
  type ConfirmKnowledgeItemDto,
  type DeleteKnowledgeItemDto,
  type EditKnowledgeItemDto,
  type GetKnowledgeContextDto,
  type KnowledgeApi,
  type KnowledgeContextDto,
  type KnowledgeDependenciesDto,
  type KnowledgeFrameDto,
  type KnowledgeItemDto,
  type KnowledgeItemPageDto,
  type KnowledgeKindDto,
  type KnowledgeLinkTypeDto,
  type KnowledgeSummaryDto,
  type ListKnowledgeItemsDto,
  type RecordKnowledgeItemDto,
  type RejectKnowledgeItemDto,
  type RetireKnowledgeItemDto,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  type ProjectMembership,
} from '../../../tenancy/index.js';
import { KnowledgeItem } from '../../domain/entities/index.js';
import {
  AnchorNotApprovedException,
  KnowledgeKindMismatchException,
} from '../../domain/exceptions/index.js';
import {
  ContextPackAssemblyService,
  DraftApprovalService,
  DraftDeletionService,
  DraftEditingService,
  DraftRejectionService,
  KnowledgeConfirmationService,
  KnowledgeRecordingService,
  KnowledgeRetirementService,
  ReviewMarkingService,
  UnlinkedKnowledgeService,
  type ContextPackCandidate,
  type SeenDraft,
} from '../../domain/services/index.js';
import {
  ContextPackRole,
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeStatus,
} from '../../domain/value-objects/index.js';
import { KnowledgeItemNotFoundException } from '../exceptions/index.js';
import {
  drawContextPack,
  drawProjectFrame,
  toChangedKnowledgeContent,
  toKnowledgeAccessDto,
  toKnowledgeContent,
  toKnowledgeContextEntryDto,
  toKnowledgeContextItemDto,
  toKnowledgeDependencyDto,
  toKnowledgeItemDto,
  toKnowledgeSource,
  toKnowledgeSummaryDto,
} from '../mappers/index.js';
import {
  KNOWLEDGE_ITEM_ORDERS,
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

/** How many items a Context Pack shows in full before the rest go brief. */
const CONTEXT_PACK_BUDGET = 40;

/** A Draft that links to the pack this way may change it; one merely using a Term does not. */
const DRAFT_NEARBY_LINKS: readonly KnowledgeLinkType[] = [
  KnowledgeLinkType.DependsOn,
  KnowledgeLinkType.JustifiedBy,
  KnowledgeLinkType.Answers,
  KnowledgeLinkType.Concerns,
  KnowledgeLinkType.ConflictsWith,
];

/** What a Context Pack's foundation walks along: what an item rests on. */
const FOUNDATION_LINKS: readonly KnowledgeLinkType[] = [
  KnowledgeLinkType.DependsOn,
  KnowledgeLinkType.JustifiedBy,
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
  readonly #contextPackAssemblyService = new ContextPackAssemblyService();
  readonly #unlinkedKnowledgeService = new UnlinkedKnowledgeService();

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
      const { member, project, projectRole } = await this.resolveForChange(
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
          source: toKnowledgeSource(caller),
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

    const newestFirst =
      query.order === KnowledgeListOrderDtoSchema.enum['newest-first'];
    const { items, total } = query.unlinked
      ? await this.listUnlinked(project.id, query, newestFirst)
      : {
          items: await this.knowledgeItemRepository.findMany(props, {
            take: query.take,
            offset: query.offset,
            order: newestFirst
              ? KNOWLEDGE_ITEM_ORDERS.newestFirst
              : KNOWLEDGE_ITEM_ORDERS.byKey,
          }),
          total: await this.knowledgeItemRepository.count(props),
        };
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

  public async summary(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<KnowledgeSummaryDto> {
    const { project, projectRole } = await this.resolve(
      caller,
      workspaceId,
      projectId,
    );
    const counts = await this.knowledgeItemRepository.countGroups({
      projectId: project.id,
    });
    const unlinked = await this.findUnlinked(project.id);

    return toKnowledgeSummaryDto(
      counts,
      unlinked.map(item => item.kind),
      projectRole,
    );
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
      dependencyNeedsReview: cascade.items.some(
        dependency => dependency !== item && dependency.needsReview(),
      ),
      links: cascade.links.map(({ from, to }) => ({
        from: from.value,
        to: to.value,
      })),
    };
  }

  public async context(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    query: GetKnowledgeContextDto,
  ): Promise<KnowledgeContextDto> {
    const { project } = await this.resolve(caller, workspaceId, projectId);
    const anchors = await this.findAnchors(project.id, query.anchors);
    const candidates = await this.gatherContext(project.id, anchors);
    const entries = this.#contextPackAssemblyService.assemble(
      candidates,
      CONTEXT_PACK_BUDGET,
    );
    const inPack = entries.map(entry => entry.item);
    const grounds = entries
      .filter(({ role }) =>
        [
          ContextPackRole.Anchor,
          ContextPackRole.Foundation,
          ContextPackRole.Rule,
        ].includes(role),
      )
      .map(entry => entry.item);
    const drafts = await this.findDraftsNear(project.id, inPack, grounds);
    const frame = await this.findFrame(project.id);
    const pack = {
      anchors: anchors.map(anchor => anchor.key.value),
      items: entries.map(toKnowledgeContextItemDto),
      links: inPack.flatMap(item =>
        item.links
          .filter(link => inPack.some(other => other.key.equals(link.target)))
          .map(link => ({
            from: item.key.value,
            to: link.target.value,
            type: link.type.value as KnowledgeLinkTypeDto,
          })),
      ),
      draftsNearby: drafts.map(draft => ({
        key: draft.key.value,
        kind: draft.kind.value as KnowledgeKindDto,
        title: draft.title.value,
      })),
      frameSize: frame.length,
    };

    return { ...pack, markdown: drawContextPack(pack) };
  }

  public async frame(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<KnowledgeFrameDto> {
    const { project } = await this.resolve(caller, workspaceId, projectId);
    const items = (await this.findFrame(project.id)).map(
      toKnowledgeContextEntryDto,
    );

    return { items, markdown: drawProjectFrame(items) };
  }

  public async edit(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.unitOfWork.run(async () => {
      const { member, project, projectRole } = await this.resolveForChange(
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
      const { project, projectRole } = await this.resolveForChange(
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
      const { member, project, projectRole } = await this.resolveForChange(
        caller,
        workspaceId,
        projectId,
      );
      // One by one: a transaction takes no parallel operations. Each item
      // once, so that no second copy of it is saved over the first.
      const drafts: SeenDraft[] = [];
      for (const { key, version } of data.items) {
        if (drafts.some(({ item }) => item.key.value === key)) {
          continue;
        }
        drafts.push({
          item: await this.getItem(project.id, key),
          seenVersion: new KnowledgeItemVersion(version),
        });
      }
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
      const marked = await this.markSourcesOf(project.id, superseded, [
        ...superseded,
        ...approved,
      ]);
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
      const { member, project, projectRole } = await this.resolveForChange(
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
      const { member, project, projectRole } = await this.resolveForChange(
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
      const { project, projectRole } = await this.resolveForChange(
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

  /** Refused while the Workspace is suspended. */
  private resolveForChange(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectMembership> {
    return this.accessResolver.resolveInProjectForChange(
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
   * The Project's unlinked items, read whole: whether an item is linked
   * depends on every Approved item, so there is no query for a page of them.
   */
  private async findUnlinked(projectId: ProjectId): Promise<KnowledgeItem[]> {
    const approved = await this.knowledgeItemRepository.findMany({
      projectId,
      statuses: [KnowledgeStatus.Approved],
    });

    return this.#unlinkedKnowledgeService.findUnlinked(approved);
  }

  /** A page of the unlinked items, of a Kind if asked, by key or the newest first. */
  private async listUnlinked(
    projectId: ProjectId,
    query: ListKnowledgeItemsDto,
    newestFirst: boolean,
  ): Promise<{ items: KnowledgeItem[]; total: number }> {
    const unlinked = (await this.findUnlinked(projectId)).filter(
      item => !query.kind || item.kind.value === query.kind,
    );
    if (newestFirst) {
      unlinked.sort((a, b) =>
        Temporal.Instant.compare(b.recordedAt, a.recordedAt),
      );
    }

    return {
      items: unlinked.slice(query.offset, query.offset + query.take),
      total: unlinked.length,
    };
  }

  /** The Anchors in the order asked, each once; each must exist and be Approved. */
  private async findAnchors(
    projectId: ProjectId,
    keys: readonly string[],
  ): Promise<KnowledgeItem[]> {
    const asked = [...new Set(keys)].map(key => KnowledgeKey.parse(key));
    const found = await this.knowledgeItemRepository.findMany({
      projectId,
      keys: asked,
    });

    return asked.map(key => {
      const anchor = found.find(item => item.key.equals(key));
      if (!anchor) {
        throw new KnowledgeItemNotFoundException(key.value);
      }
      if (!anchor.isApproved()) {
        throw new AnchorNotApprovedException(
          key.value,
          anchor.status.value,
          anchor.supersededByKey?.value ?? null,
        );
      }

      return anchor;
    });
  }

  /**
   * Every Approved item a Context Pack takes, for each reason it is found:
   * the Anchors; what they rest on, level by level, each once, so that cycles
   * end; the Business Rules that depend on any of those; what links to an
   * Anchor; the Terms used; what conflicts with any of
   * them; and the Open Questions about any of them not answered yet.
   */
  private async gatherContext(
    projectId: ProjectId,
    anchors: readonly KnowledgeItem[],
  ): Promise<ContextPackCandidate[]> {
    const candidates: ContextPackCandidate[] = anchors.map(item => ({
      item,
      role: ContextPackRole.Anchor,
      distance: 0,
    }));
    const distances = new Map(anchors.map(item => [item.key.value, 0]));
    const take = (
      items: readonly KnowledgeItem[],
      role: ContextPackRole,
      distanceOf: (item: KnowledgeItem) => number,
    ): KnowledgeItem[] => {
      const added = items.filter(
        (item, index) =>
          item.isApproved() &&
          items.findIndex(other => other.key.equals(item.key)) === index,
      );
      for (const item of added) {
        const distance = distanceOf(item);
        candidates.push({ item, role, distance });
        const held = distances.get(item.key.value);
        distances.set(
          item.key.value,
          held === undefined ? distance : Math.min(held, distance),
        );
      }

      return added;
    };
    const inPack = () => candidates.map(candidate => candidate.item);
    const nearest = (keys: readonly KnowledgeKey[]) =>
      Math.min(...keys.map(key => distances.get(key.value) ?? Infinity));

    let level: readonly KnowledgeItem[] = anchors;
    for (let distance = 1; level.length > 0; distance++) {
      const targets = await this.findLinked(projectId, level, FOUNDATION_LINKS);
      level = take(
        targets.filter(item => !distances.has(item.key.value)),
        ContextPackRole.Foundation,
        () => distance,
      );
    }

    const grounds = inPack();
    const rules = await this.knowledgeItemRepository.findMany({
      projectId,
      kind: KnowledgeKind.BusinessRule,
      linkingTo: {
        keys: grounds.map(item => item.key),
        types: [KnowledgeLinkType.DependsOn],
      },
      statuses: [KnowledgeStatus.Approved],
    });
    take(rules, ContextPackRole.Rule, rule => 1 + nearest(rule.dependencies()));

    const anchorKeys = anchors.map(anchor => anchor.key);
    const linkingToAnchors = await this.knowledgeItemRepository.findMany({
      projectId,
      linkingTo: { keys: anchorKeys },
      statuses: [KnowledgeStatus.Approved],
    });
    take(
      linkingToAnchors.filter(item =>
        item.links.some(
          link =>
            anchorKeys.some(key => key.equals(link.target)) &&
            !link.type.equals(KnowledgeLinkType.Concerns) &&
            !link.type.equals(KnowledgeLinkType.ConflictsWith),
        ),
      ),
      ContextPackRole.MayBeAffected,
      () => 1,
    );

    const users = inPack();
    take(
      await this.findLinked(projectId, users, [KnowledgeLinkType.UsesTerm]),
      ContextPackRole.Term,
      term =>
        1 +
        nearest(
          users
            .filter(user =>
              user.links.some(link => link.target.equals(term.key)),
            )
            .map(user => user.key),
        ),
    );

    const related = inPack();
    const relatedKeys = related.map(item => item.key);
    const conflicting = [
      ...(await this.findLinked(projectId, related, [
        KnowledgeLinkType.ConflictsWith,
      ])),
      ...(await this.knowledgeItemRepository.findMany({
        projectId,
        linkingTo: {
          keys: relatedKeys,
          types: [KnowledgeLinkType.ConflictsWith],
        },
        statuses: [KnowledgeStatus.Approved],
      })),
    ];
    take(conflicting, ContextPackRole.Conflict, item =>
      distanceBetween(item, related, nearest),
    );

    const concerned = inPack();
    const questions = await this.knowledgeItemRepository.findMany({
      projectId,
      kind: KnowledgeKind.OpenQuestion,
      linkingTo: {
        keys: concerned.map(item => item.key),
        types: [KnowledgeLinkType.Concerns],
      },
      statuses: [KnowledgeStatus.Approved],
    });
    const answers = await this.findAnswers(projectId, questions);
    take(
      questions.filter(question => answeredBy(question, answers).length === 0),
      ContextPackRole.Unsettled,
      question => 1 + nearest(question.links.map(link => link.target)),
    );

    return candidates;
  }

  /** The targets of the items' Links of these types, in any status. */
  private findLinked(
    projectId: ProjectId,
    items: readonly KnowledgeItem[],
    types: readonly KnowledgeLinkType[],
  ): Promise<KnowledgeItem[]> {
    return this.findTargets(
      projectId,
      items.flatMap(item =>
        item.links.filter(link => types.some(type => type.equals(link.type))),
      ),
    );
  }

  /**
   * The Drafts the pack's items link to, and those that link to what the task
   * rests on (its Anchors, foundation and rules) other than by using a Term,
   * by key.
   */
  private async findDraftsNear(
    projectId: ProjectId,
    inPack: readonly KnowledgeItem[],
    grounds: readonly KnowledgeItem[],
  ): Promise<KnowledgeItem[]> {
    const linked = await this.findTargets(
      projectId,
      inPack.flatMap(item => item.links),
    );
    const linking = await this.knowledgeItemRepository.findMany({
      projectId,
      linkingTo: {
        keys: grounds.map(item => item.key),
        types: DRAFT_NEARBY_LINKS,
      },
      statuses: [KnowledgeStatus.Draft],
    });

    return [...linked.filter(item => item.isDraft()), ...linking]
      .filter(
        (item, index, drafts) =>
          drafts.findIndex(other => other.key.equals(item.key)) === index,
      )
      .sort(
        (a, b) =>
          KnowledgeKind.all.indexOf(a.kind) -
            KnowledgeKind.all.indexOf(b.kind) || a.key.number - b.key.number,
      );
  }

  /**
   * The Project Frame: the Approved Product Overview, Constraints and
   * non-functional Requirements, in that order.
   */
  private async findFrame(projectId: ProjectId): Promise<KnowledgeItem[]> {
    const approved = (kind: KnowledgeKind) =>
      this.knowledgeItemRepository.findMany({
        projectId,
        kind,
        statuses: [KnowledgeStatus.Approved],
      });
    const requirements = await approved(KnowledgeKind.Requirement);

    return [
      ...(await approved(KnowledgeKind.ProductOverview)),
      ...(await approved(KnowledgeKind.Constraint)),
      ...requirements.filter(item => item.isOfProjectFrame()),
    ];
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

/** One step further than the nearest item it links to or that links to it. */
function distanceBetween(
  item: KnowledgeItem,
  related: readonly KnowledgeItem[],
  nearest: (keys: readonly KnowledgeKey[]) => number,
): number {
  const touching = related.filter(
    other =>
      item.links.some(link => link.target.equals(other.key)) ||
      other.links.some(link => link.target.equals(item.key)),
  );

  return 1 + nearest(touching.map(other => other.key));
}
