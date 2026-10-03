import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import {
  KNOWLEDGE_ITEM_ORDERS,
  KnowledgeItemRepository,
  type KnowledgeItemCount,
  type KnowledgeItemDeleteProps,
  type KnowledgeItemPage,
  type KnowledgeItemQueryProps,
} from '../../../application/ports/outbound/index.js';
import { KnowledgeItem } from '../../../domain/entities/index.js';
import {
  createKnowledgeContent,
  KnowledgeKind,
  KnowledgeStatus,
  type KnowledgeItemId,
} from '../../../domain/value-objects/index.js';
import { KnowledgeItemModel } from '../../database/index.js';

@Injectable()
export class KnowledgeItemRepositoryAdapter extends KnowledgeItemRepository {
  constructor(
    @InjectModel(KnowledgeItemModel.name)
    private readonly knowledgeItemModel: Model<KnowledgeItemModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(item: KnowledgeItem): Promise<void> {
    await this.knowledgeItemModel
      .replaceOne(
        { _id: item.id.value },
        {
          workspaceId: item.workspaceId.value,
          projectId: item.projectId.value,
          kind: item.kind.value,
          number: item.key.number,
          title: item.title.value,
          status: item.status.value,
          source: item.source.value,
          rationale: item.rationale?.value ?? null,
          fields: item.content.toFields(),
          authorId: item.author.memberId?.value ?? null,
          recordedAt: toDate(item.recordedAt),
          lastEditedBy: item.lastEditedBy?.value ?? null,
          lastEditedAt: item.lastEditedAt && toDate(item.lastEditedAt),
          approvedBy: item.approvedBy?.value ?? null,
          approvedAt: item.approvedAt && toDate(item.approvedAt),
          rejectedBy: item.rejectedBy?.value ?? null,
          rejectedAt: item.rejectedAt && toDate(item.rejectedAt),
          rejectionReason: item.rejectionReason?.value ?? null,
          supersedes: item.supersedes?.value ?? null,
          supersededBy: item.supersededBy?.value ?? null,
          supersededAt: item.supersededAt && toDate(item.supersededAt),
          supersededByKey: item.supersededByKey?.value ?? null,
          retiredBy: item.retiredBy?.value ?? null,
          retiredAt: item.retiredAt && toDate(item.retiredAt),
          retirementReason: item.retirementReason?.value ?? null,
          featureAssignedBy: item.featureAssignedBy?.value ?? null,
          featureAssignedAt:
            item.featureAssignedAt && toDate(item.featureAssignedAt),
          links: item.links.map(link => link.toProps()),
          reviewCauses: item.reviewCauses.map(cause => cause.value),
          version: item.version.value,
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(
    props: KnowledgeItemQueryProps,
  ): Promise<KnowledgeItem | null> {
    const document = await this.knowledgeItemModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(
    props: KnowledgeItemQueryProps,
    page?: KnowledgeItemPage,
  ): Promise<KnowledgeItem[]> {
    if (matchesNothing(props)) {
      return [];
    }
    let query = this.knowledgeItemModel.find(this.toFilter(props)).sort(
      page?.order === KNOWLEDGE_ITEM_ORDERS.newestFirst
        ? // The id breaks ties between items recorded in the same millisecond, so pages stay stable.
          { recordedAt: -1, _id: -1 }
        : { kind: 1, number: 1 },
    );
    if (page) {
      query = query.skip(page.offset).limit(page.take);
    }
    const documents = await query
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  public async count(props: KnowledgeItemQueryProps): Promise<number> {
    if (matchesNothing(props)) {
      return 0;
    }

    return this.knowledgeItemModel
      .countDocuments(this.toFilter(props))
      .session(this.unitOfWork.session)
      .exec();
  }

  public async countGroups(
    props: KnowledgeItemQueryProps,
  ): Promise<KnowledgeItemCount[]> {
    if (matchesNothing(props)) {
      return [];
    }
    const groups = await this.knowledgeItemModel
      .aggregate<{
        _id: { kind: string; status: string; needsReview: boolean };
        count: number;
      }>([
        // An aggregation is not cast by the schema, unlike find: the id goes as a UUID.
        {
          $match: {
            ...this.toFilter(props),
            projectId: new Types.UUID(props.projectId.value),
          },
        },
        {
          $group: {
            _id: {
              kind: '$kind',
              status: '$status',
              needsReview: { $gt: [{ $size: '$reviewCauses' }, 0] },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .session(this.unitOfWork.session)
      .exec();

    return groups.map(({ _id, count }) => ({
      kind: KnowledgeKind.from(_id.kind),
      status: KnowledgeStatus.from(_id.status),
      needsReview: _id.needsReview,
      count,
    }));
  }

  public async delete(id: KnowledgeItemId): Promise<void> {
    await this.knowledgeItemModel
      .deleteOne({ _id: id.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  public async deleteMany(props: KnowledgeItemDeleteProps): Promise<void> {
    await this.knowledgeItemModel
      .deleteMany(
        'workspaceId' in props
          ? { workspaceId: props.workspaceId.value }
          : { projectId: props.projectId.value },
      )
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toFilter(props: KnowledgeItemQueryProps) {
    const kind = props.key?.kind ?? props.kind;

    return {
      projectId: props.projectId.value,
      ...(kind && { kind: kind.value }),
      ...(props.key && { number: props.key.number }),
      ...(props.statuses && {
        status: { $in: props.statuses.map(status => status.value) },
      }),
      ...(props.keys && {
        $or: props.keys.map(key => ({
          kind: key.kind.value,
          number: key.number,
        })),
      }),
      ...(props.linkingTo && {
        links: {
          $elemMatch: {
            key: { $in: props.linkingTo.keys.map(key => key.value) },
            ...(props.linkingTo.types && {
              type: { $in: props.linkingTo.types.map(type => type.value) },
            }),
          },
        },
      }),
      ...(props.needsReview === true && {
        'reviewCauses.0': { $exists: true },
      }),
      ...(props.needsReview === false && { reviewCauses: { $size: 0 } }),
      ...(props.approvedAfter && {
        approvedAt: { $gt: toDate(props.approvedAfter) },
      }),
      ...(props.retiredAfter && {
        retiredAt: { $gt: toDate(props.retiredAfter) },
      }),
    };
  }

  private toDomain(document: KnowledgeItemModel): KnowledgeItem {
    return KnowledgeItem.restore({
      id: document._id.toHexString(),
      workspaceId: document.workspaceId.toHexString(),
      projectId: document.projectId.toHexString(),
      kind: document.kind,
      number: document.number,
      title: document.title,
      status: document.status,
      source: document.source,
      rationale: document.rationale,
      content: createKnowledgeContent(
        KnowledgeKind.from(document.kind),
        document.fields,
      ),
      authorId: document.authorId?.toHexString() ?? null,
      recordedAt: toInstant(document.recordedAt),
      lastEditedBy: document.lastEditedBy?.toHexString() ?? null,
      lastEditedAt: document.lastEditedAt && toInstant(document.lastEditedAt),
      approvedBy: document.approvedBy?.toHexString() ?? null,
      approvedAt: document.approvedAt && toInstant(document.approvedAt),
      rejectedBy: document.rejectedBy?.toHexString() ?? null,
      rejectedAt: document.rejectedAt && toInstant(document.rejectedAt),
      rejectionReason: document.rejectionReason,
      supersedes: document.supersedes,
      supersededBy: document.supersededBy?.toHexString() ?? null,
      supersededAt: document.supersededAt && toInstant(document.supersededAt),
      supersededByKey: document.supersededByKey,
      retiredBy: document.retiredBy?.toHexString() ?? null,
      retiredAt: document.retiredAt && toInstant(document.retiredAt),
      retirementReason: document.retirementReason,
      featureAssignedBy: document.featureAssignedBy?.toHexString() ?? null,
      featureAssignedAt:
        document.featureAssignedAt && toInstant(document.featureAssignedAt),
      links: document.links,
      reviewCauses: document.reviewCauses,
      version: document.version,
    });
  }
}

/** Asked for none of no keys: an empty `$or` is not a valid filter. */
function matchesNothing(props: KnowledgeItemQueryProps): boolean {
  return props.keys?.length === 0 || props.linkingTo?.keys.length === 0;
}

function toDate(instant: Temporal.Instant): Date {
  return new Date(instant.epochMilliseconds);
}

function toInstant(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

export const KNOWLEDGE_ITEM_REPOSITORY_PROVIDER: Provider = {
  provide: KnowledgeItemRepository,
  useClass: KnowledgeItemRepositoryAdapter,
};
