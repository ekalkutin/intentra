import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { KnowledgeRetirementForbiddenException } from '../exceptions/index.js';
import type { KnowledgeItemVersion } from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class KnowledgeRetirementService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** A Maintainer of the Project marks an Approved item Obsolete with nothing to replace it. */
  public retire(
    retirer: Member,
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
    reason: string | null,
  ): void {
    if (!this.#knowledgePolicyService.canRetire(projectRole, item)) {
      throw new KnowledgeRetirementForbiddenException();
    }
    item.retire(retirer.id, seenVersion, reason);
  }
}
