import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { DraftApprovalForbiddenException } from '../exceptions/index.js';
import type { KnowledgeItemVersion } from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftApprovalService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** A Maintainer of the Project approves a Draft, their own included. */
  public approve(
    approver: Member,
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
  ): void {
    if (!this.#knowledgePolicyService.canApproveDraft(projectRole, item)) {
      throw new DraftApprovalForbiddenException();
    }
    item.approve(approver.id, seenVersion);
  }
}
