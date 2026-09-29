import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem, type KnowledgeItemChanges } from '../entities/index.js';
import { DraftEditingForbiddenException } from '../exceptions/index.js';
import type { KnowledgeItemVersion } from '../value-objects/index.js';

import { KnowledgeLinkingService } from './knowledge-linking.service.js';
import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class DraftEditingService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();
  readonly #knowledgeLinkingService = new KnowledgeLinkingService();

  /** Any Contributor or Maintainer of the Project edits a Draft, not only its author. */
  public edit(
    editor: Member,
    projectRole: ProjectRole,
    item: KnowledgeItem,
    seenVersion: KnowledgeItemVersion,
    changes: KnowledgeItemChanges,
    linkTargets: readonly KnowledgeItem[],
  ): void {
    if (!this.#knowledgePolicyService.canEditDraft(projectRole, item)) {
      throw new DraftEditingForbiddenException();
    }
    if (changes.links) {
      this.#knowledgeLinkingService.ensureLinkable(changes.links, linkTargets);
    }
    item.edit(editor.id, seenVersion, changes);
  }
}
