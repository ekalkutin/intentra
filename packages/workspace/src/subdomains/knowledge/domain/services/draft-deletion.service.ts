import type { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { DraftDeletionForbiddenException } from '../exceptions/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftDeletionService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** Any Contributor or Maintainer of the Project deletes a Draft recorded by mistake. */
  public ensureDeletable(projectRole: ProjectRole, item: KnowledgeItem): void {
    if (!this.#knowledgePolicyService.canDeleteDraft(projectRole, item)) {
      throw new DraftDeletionForbiddenException();
    }
  }
}
