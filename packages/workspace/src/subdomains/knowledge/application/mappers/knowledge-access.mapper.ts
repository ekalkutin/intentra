import type {
  KnowledgeAccessDto,
  KnowledgeItemAccessDto,
  KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import type { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../../domain/entities/index.js';
import { KnowledgePolicyService } from '../../domain/services/index.js';
import { KnowledgeKind } from '../../domain/value-objects/index.js';

const knowledgePolicyService = new KnowledgePolicyService();

/** Whether they may, and whether the Knowledge Item, only a Draft, can change at all. */
export function toKnowledgeItemAccessDto(
  item: KnowledgeItem,
  projectRole: ProjectRole,
): KnowledgeItemAccessDto {
  const draft = item.isDraft();

  return {
    canEdit: draft && knowledgePolicyService.canEditDraft(projectRole, item),
    canDelete:
      draft && knowledgePolicyService.canDeleteDraft(projectRole, item),
    canApprove:
      draft && knowledgePolicyService.canApproveDraft(projectRole, item),
    canReject:
      draft && knowledgePolicyService.canRejectDraft(projectRole, item),
  };
}

export function toKnowledgeAccessDto(
  projectRole: ProjectRole,
): KnowledgeAccessDto {
  return {
    canRecord: KnowledgeKind.all
      .filter(kind => knowledgePolicyService.canRecordDraft(projectRole, kind))
      .map(kind => kind.value as KnowledgeKindDto),
  };
}
