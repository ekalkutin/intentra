import { Injectable, type Provider } from '@nestjs/common';

import {
  intentraCaller,
  KnowledgeKindDtoSchema,
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type ListKnowledgeItemsDto,
} from '@intentra/contracts/workspace';

import { KnowledgeService } from '../../../../knowledge/index.js';
import type { Project } from '../../../../tenancy/index.js';
import {
  AuditedKnowledge,
  type AuditQuestion,
} from '../../../application/ports/outbound/index.js';

/** The most a list gives in one page. */
const PAGE = 200;

/** Asks Knowledge through its published API, as Intentra itself. */
@Injectable()
export class AuditedKnowledgeAdapter implements AuditedKnowledge {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  public async read(project: Project): Promise<KnowledgeItemDto[]> {
    return [
      ...(await this.readAll(project, {
        statuses: [
          KnowledgeStatusDtoSchema.enum.draft,
          KnowledgeStatusDtoSchema.enum.approved,
        ],
      })),
      ...(await this.readAll(project, {
        kind: KnowledgeKindDtoSchema.enum['open-question'],
        statuses: [KnowledgeStatusDtoSchema.enum.rejected],
      })),
    ];
  }

  public async similar(
    project: Project,
    key: string,
    take: number,
  ): Promise<string[]> {
    const similar = await this.knowledgeService.similar(
      intentraCaller(project.id.value),
      project.workspaceId.value,
      project.id.value,
      key,
      { take },
    );

    return similar.items.map(item => item.key);
  }

  public record(
    project: Project,
    question: AuditQuestion,
  ): Promise<KnowledgeItemDto> {
    return this.knowledgeService.record(
      intentraCaller(project.id.value),
      project.workspaceId.value,
      project.id.value,
      {
        kind: KnowledgeKindDtoSchema.enum['open-question'],
        title: question.title,
        rationale: question.rationale,
        supersedes: null,
        links: question.concerns.map(key => ({
          type: KnowledgeLinkTypeDtoSchema.enum.concerns,
          key,
        })),
        fields: { question: question.question },
      },
    );
  }

  private async readAll(
    project: Project,
    query: Pick<ListKnowledgeItemsDto, 'kind' | 'statuses'>,
  ): Promise<KnowledgeItemDto[]> {
    const items: KnowledgeItemDto[] = [];
    let total = Infinity;
    while (items.length < total) {
      const page = await this.knowledgeService.list(
        intentraCaller(project.id.value),
        project.workspaceId.value,
        project.id.value,
        { ...query, take: PAGE, offset: items.length },
      );
      items.push(...page.items);
      total = page.items.length === 0 ? items.length : page.total;
    }

    return items;
  }
}

export const AUDITED_KNOWLEDGE_PROVIDER: Provider = {
  provide: AuditedKnowledge,
  useClass: AuditedKnowledgeAdapter,
};
