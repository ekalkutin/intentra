import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  DraftApprovalForbiddenException,
  ProductOverviewAlreadyApprovedException,
  SupersededItemNotApprovedException,
} from '../exceptions/index.js';
import {
  KnowledgeKind,
  type KnowledgeItemVersion,
} from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftApprovalService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /**
   * A Maintainer of the Project approves a Draft, their own included. If it
   * replaces an Approved item, that one becomes Obsolete at the same moment:
   * a Supersession. A Project has one Approved Product Overview, changed only
   * by Supersession.
   */
  public approve(
    approver: Member,
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
    context: DraftApprovalContext,
  ): void {
    if (!this.#knowledgePolicyService.canApproveDraft(projectRole, item)) {
      throw new DraftApprovalForbiddenException();
    }
    const { replaced, approvedProductOverview } = context;
    if (item.supersedes && !replaced?.isApproved()) {
      throw new SupersededItemNotApprovedException();
    }
    if (
      item.kind.equals(KnowledgeKind.ProductOverview) &&
      approvedProductOverview &&
      !item.supersedes?.equals(approvedProductOverview.key)
    ) {
      throw new ProductOverviewAlreadyApprovedException();
    }

    item.approve(approver.id, seenVersion);
    replaced?.becomeSupersededBy(item.key, approver.id);
  }
}

type DraftApprovalContext = {
  /** The item the Draft `supersedes`, or null if it replaces none. */
  readonly replaced: KnowledgeItem | null;
  /** The Project's Approved Product Overview, when a Product Overview is approved. */
  readonly approvedProductOverview: KnowledgeItem | null;
};
