import type { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { KnowledgeConfirmationForbiddenException } from '../exceptions/index.js';
import type { KnowledgeItemVersion } from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class KnowledgeConfirmationService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** A person confirms that a marked item still holds on what its changed targets became. */
  public confirm(
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
    causes: readonly KnowledgeItem[],
  ): void {
    if (!this.#knowledgePolicyService.canConfirm(projectRole, item)) {
      throw new KnowledgeConfirmationForbiddenException();
    }
    item.confirm(
      seenVersion,
      cause =>
        causes.find(changed => changed.key.equals(cause))?.supersededByKey ??
        null,
    );
  }
}
