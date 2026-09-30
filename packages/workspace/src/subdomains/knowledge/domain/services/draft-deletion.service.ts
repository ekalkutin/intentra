import type { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  DraftDeletionForbiddenException,
  KnowledgeItemLinkedException,
} from '../exceptions/index.js';
import type { KnowledgeItemVersion } from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftDeletionService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /**
   * Any Contributor or Maintainer of the Project deletes a Draft recorded by
   * mistake, unless a Draft or an Approved item links to it: no Link may lead
   * nowhere.
   */
  public ensureDeletable(
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
    linkingItems: readonly KnowledgeItem[],
  ): void {
    if (!this.#knowledgePolicyService.canDeleteDraft(projectRole, item)) {
      throw new DraftDeletionForbiddenException();
    }
    item.ensureDeletable(seenVersion);
    const current = linkingItems.filter(
      linking => linking.isDraft() || linking.isApproved(),
    );
    if (current.length > 0) {
      throw new KnowledgeItemLinkedException(
        current.map(linking => linking.key.value),
      );
    }
  }
}
