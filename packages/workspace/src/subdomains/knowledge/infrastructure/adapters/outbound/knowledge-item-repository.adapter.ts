import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import {
  KnowledgeItemRepository,
  type KnowledgeItemDeleteProps,
  type KnowledgeItemPage,
  type KnowledgeItemQueryProps,
} from '../../../application/ports/outbound/index.js';
import { KnowledgeItem } from '../../../domain/entities/index.js';
import {
  createKnowledgeContent,
  KnowledgeKind,
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
          authorId: item.authorId.value,
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
    page: KnowledgeItemPage,
  ): Promise<KnowledgeItem[]> {
    const documents = await this.knowledgeItemModel
      .find(this.toFilter(props))
      .sort({ kind: 1, number: 1 })
      .skip(page.offset)
      .limit(page.take)
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  public count(props: KnowledgeItemQueryProps): Promise<number> {
    return this.knowledgeItemModel
      .countDocuments(this.toFilter(props))
      .session(this.unitOfWork.session)
      .exec();
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
    };
  }

  private toDomain(document: KnowledgeItemModel): KnowledgeItem {
    return KnowledgeItem.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      projectId: document.projectId,
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
      authorId: document.authorId,
      recordedAt: toInstant(document.recordedAt),
      lastEditedBy: document.lastEditedBy,
      lastEditedAt: document.lastEditedAt && toInstant(document.lastEditedAt),
      approvedBy: document.approvedBy,
      approvedAt: document.approvedAt && toInstant(document.approvedAt),
      rejectedBy: document.rejectedBy,
      rejectedAt: document.rejectedAt && toInstant(document.rejectedAt),
      rejectionReason: document.rejectionReason,
      supersedes: document.supersedes,
      supersededBy: document.supersededBy,
      supersededAt: document.supersededAt && toInstant(document.supersededAt),
      supersededByKey: document.supersededByKey,
      retiredBy: document.retiredBy,
      retiredAt: document.retiredAt && toInstant(document.retiredAt),
      retirementReason: document.retirementReason,
      version: document.version,
    });
  }
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
