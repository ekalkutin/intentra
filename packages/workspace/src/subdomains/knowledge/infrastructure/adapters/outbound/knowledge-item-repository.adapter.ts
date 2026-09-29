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
  DecisionContent,
  KnowledgeKind,
  RequirementContent,
  TermContent,
  type KnowledgeContent,
  type KnowledgeItemId,
} from '../../../domain/value-objects/index.js';
import {
  KnowledgeItemModel,
  type DecisionFieldsDocument,
  type RequirementFieldsDocument,
  type TermFieldsDocument,
} from '../../database/index.js';

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
          fields: toFieldsDocument(item.content),
          authorId: item.authorId.value,
          recordedAt: toDate(item.recordedAt),
          lastEditedBy: item.lastEditedBy?.value ?? null,
          lastEditedAt: item.lastEditedAt && toDate(item.lastEditedAt),
          approvedBy: item.approvedBy?.value ?? null,
          approvedAt: item.approvedAt && toDate(item.approvedAt),
          rejectedBy: item.rejectedBy?.value ?? null,
          rejectedAt: item.rejectedAt && toDate(item.rejectedAt),
          rejectionReason: item.rejectionReason?.value ?? null,
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
      content: toContent(KnowledgeKind.from(document.kind), document.fields),
      authorId: document.authorId,
      recordedAt: toInstant(document.recordedAt),
      lastEditedBy: document.lastEditedBy,
      lastEditedAt: document.lastEditedAt && toInstant(document.lastEditedAt),
      approvedBy: document.approvedBy,
      approvedAt: document.approvedAt && toInstant(document.approvedAt),
      rejectedBy: document.rejectedBy,
      rejectedAt: document.rejectedAt && toInstant(document.rejectedAt),
      rejectionReason: document.rejectionReason,
      version: document.version,
    });
  }
}

function toFieldsDocument(
  content: KnowledgeContent,
): TermFieldsDocument | RequirementFieldsDocument | DecisionFieldsDocument {
  if (content instanceof TermContent) {
    return {
      definition: content.definition.value,
      sort: content.sort?.value ?? null,
      synonymsToAvoid: content.synonymsToAvoid.map(synonym => synonym.value),
    };
  }
  if (content instanceof RequirementContent) {
    return {
      statement: content.statement.value,
      type: content.type?.value ?? null,
      priority: content.priority?.value ?? null,
      acceptanceCriteria: content.acceptanceCriteria.map(
        criterion => criterion.value,
      ),
    };
  }

  return {
    decision: content.decision.value,
    area: content.area?.value ?? null,
    context: content.context?.value ?? null,
    rejectedAlternatives: content.rejectedAlternatives.map(alternative => ({
      alternative: alternative.alternative.value,
      reason: alternative.reason?.value ?? null,
    })),
  };
}

function toContent(
  kind: KnowledgeKind,
  fields: KnowledgeItemModel['fields'],
): KnowledgeContent {
  if (kind.equals(KnowledgeKind.Term)) {
    return new TermContent(fields as TermFieldsDocument);
  }
  if (kind.equals(KnowledgeKind.Requirement)) {
    return new RequirementContent(fields as RequirementFieldsDocument);
  }

  return new DecisionContent(fields as DecisionFieldsDocument);
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
