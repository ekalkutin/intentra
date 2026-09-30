import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  DependenciesNotApprovedException,
  DraftApprovalForbiddenException,
  KnowledgeItemNeedsReviewException,
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
   * A Maintainer of the Project approves Drafts together, all or nothing,
   * their own included. What a Draft depends on must be Approved already or
   * approved with it. A Draft that replaces an Approved item makes that one
   * Obsolete at the same moment: a Supersession. A Project has one Approved
   * Product Overview, changed only by Supersession.
   *
   * @returns the items that became Obsolete, whose sources are to be marked
   */
  public approve(
    approver: Member,
    projectRole: ProjectRole,
    drafts: readonly SeenDraft[],
    context: DraftApprovalContext,
  ): KnowledgeItem[] {
    for (const { item } of drafts) {
      if (!this.#knowledgePolicyService.canApproveDraft(projectRole, item)) {
        throw new DraftApprovalForbiddenException();
      }
      // Before the dependencies: confirming it may move its Links onto
      // Approved replacements, which settles them too.
      if (item.needsReview()) {
        throw new KnowledgeItemNeedsReviewException();
      }
    }
    this.#ensureDependenciesApproved(drafts, context);

    let approvedProductOverview = context.approvedProductOverview;
    const superseded: KnowledgeItem[] = [];
    for (const { item, seenVersion } of drafts) {
      const replaced = item.supersedes && context.find(item.supersedes);
      if (item.supersedes && !replaced?.isApproved()) {
        throw new SupersededItemNotApprovedException();
      }
      if (item.kind.equals(KnowledgeKind.ProductOverview)) {
        if (
          approvedProductOverview &&
          !item.supersedes?.equals(approvedProductOverview.key)
        ) {
          throw new ProductOverviewAlreadyApprovedException();
        }
        approvedProductOverview = item;
      }

      item.approve(approver.id, seenVersion);
      if (replaced) {
        replaced.becomeSupersededBy(item.key, approver.id);
        superseded.push(replaced);
      }
    }

    return superseded;
  }

  #ensureDependenciesApproved(
    drafts: readonly SeenDraft[],
    context: DraftApprovalContext,
  ): void {
    const missing = new Set<string>();
    for (const { item } of drafts) {
      for (const dependency of item.dependencies()) {
        const together = drafts.some(draft =>
          draft.item.key.equals(dependency),
        );
        if (!together && !context.find(dependency)?.isApproved()) {
          missing.add(dependency.value);
        }
      }
    }
    if (missing.size > 0) {
      throw new DependenciesNotApprovedException([...missing]);
    }
  }
}

/** A Draft and the version the approver saw. */
export type SeenDraft = {
  readonly item: KnowledgeItem;
  readonly seenVersion: KnowledgeItemVersion;
};

type DraftApprovalContext = {
  /** Finds an item the Drafts replace or depend on, by its Knowledge Key. */
  readonly find: (key: KnowledgeItem['key']) => KnowledgeItem | null;
  /** The Project's Approved Product Overview, when a Product Overview is approved. */
  readonly approvedProductOverview: KnowledgeItem | null;
};
