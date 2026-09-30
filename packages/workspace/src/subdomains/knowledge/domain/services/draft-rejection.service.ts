import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { DraftRejectionForbiddenException } from '../exceptions/index.js';
import type { KnowledgeItemVersion } from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftRejectionService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** A Maintainer of the Project rejects a Draft, optionally saying why. */
  public reject(
    rejecter: Member,
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
    reason: string | null,
  ): void {
    if (!this.#knowledgePolicyService.canRejectDraft(projectRole, item)) {
      throw new DraftRejectionForbiddenException();
    }
    item.reject(rejecter.id, seenVersion, reason);
  }
}
