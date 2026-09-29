import type {
  DecisionFieldsDto,
  KnowledgeItemDto,
  KnowledgeSourceDto,
  KnowledgeStatusDto,
  RequirementFieldsDto,
  TermFieldsDto,
} from '@intentra/contracts/workspace';

import { KnowledgeItem } from '../../domain/entities/index.js';
import {
  DecisionContent,
  RequirementContent,
  TermContent,
} from '../../domain/value-objects/index.js';

import { toIsoString } from './instant.mapper.js';

export function toKnowledgeItemDto(item: KnowledgeItem): KnowledgeItemDto {
  const frame = {
    id: item.id.value,
    key: item.key.value,
    title: item.title.value,
    status: item.status.value as KnowledgeStatusDto,
    source: item.source.value as KnowledgeSourceDto,
    rationale: item.rationale?.value ?? null,
    authorId: item.authorId.value,
    recordedAt: toIsoString(item.recordedAt),
    lastEditedBy: item.lastEditedBy?.value ?? null,
    lastEditedAt: item.lastEditedAt && toIsoString(item.lastEditedAt),
  };
  const content = item.content;

  if (content instanceof TermContent) {
    return { ...frame, kind: 'term', fields: toTermFieldsDto(content) };
  }
  if (content instanceof RequirementContent) {
    return {
      ...frame,
      kind: 'requirement',
      fields: toRequirementFieldsDto(content),
    };
  }

  return { ...frame, kind: 'decision', fields: toDecisionFieldsDto(content) };
}

function toTermFieldsDto(content: TermContent): TermFieldsDto {
  return {
    definition: content.definition.value,
    sort: (content.sort?.value ?? null) as TermFieldsDto['sort'],
    synonymsToAvoid: content.synonymsToAvoid.map(synonym => synonym.value),
  };
}

function toRequirementFieldsDto(
  content: RequirementContent,
): RequirementFieldsDto {
  return {
    statement: content.statement.value,
    type: (content.type?.value ?? null) as RequirementFieldsDto['type'],
    priority: (content.priority?.value ??
      null) as RequirementFieldsDto['priority'],
    acceptanceCriteria: content.acceptanceCriteria.map(
      criterion => criterion.value,
    ),
  };
}

function toDecisionFieldsDto(content: DecisionContent): DecisionFieldsDto {
  return {
    decision: content.decision.value,
    area: (content.area?.value ?? null) as DecisionFieldsDto['area'],
    context: content.context?.value ?? null,
    rejectedAlternatives: content.rejectedAlternatives.map(alternative => ({
      alternative: alternative.alternative.value,
      reason: alternative.reason?.value ?? null,
    })),
  };
}
