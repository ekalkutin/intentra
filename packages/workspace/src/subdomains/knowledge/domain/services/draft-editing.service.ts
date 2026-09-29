import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem, type KnowledgeItemChanges } from '../entities/index.js';
import { DraftEditingForbiddenException } from '../exceptions/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftEditingService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** Any Contributor or Maintainer of the Project edits a Draft, not only its author. */
  public edit(
    editor: Member,
    projectRole: ProjectRole,
    item: KnowledgeItem,
    changes: KnowledgeItemChanges,
  ): void {
    if (!this.#knowledgePolicyService.canEditDraft(projectRole, item)) {
      throw new DraftEditingForbiddenException();
    }
    item.edit(editor.id, changes);
  }
}
