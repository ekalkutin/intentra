import { KnowledgeItem } from '../entities/index.js';
import { KnowledgeKind } from '../value-objects/index.js';

export class ReviewMarkingService {
  /**
   * An item was rejected, superseded or retired: whatever depends on it or is
   * justified by it may no longer be true. Only its direct sources are
   * marked; the mark goes further only when one of them changes in turn. A
   * `replacement` that says the same and only adds Links marks nothing: its
   * sources rest on it instead.
   */
  public markSources(
    changed: KnowledgeItem,
    sources: readonly KnowledgeItem[],
    replacement: KnowledgeItem | null = null,
  ): void {
    const same = replacement?.onlyAddsLinksTo(changed) ? replacement : null;
    for (const source of sources) {
      if (!source.restsOn(changed.key)) {
        continue;
      }
      if (same) {
        source.followReplacement(changed.key, same.key);
      } else {
        source.markForReview(changed.key);
      }
    }
  }

  /**
   * A Term was replaced: what uses it now uses its replacement, the word's
   * current meaning, with no Needs Review (a Term's users are never marked).
   */
  public moveTermUsers(
    replaced: KnowledgeItem,
    replacement: KnowledgeItem,
    users: readonly KnowledgeItem[],
  ): void {
    if (!replaced.kind.equals(KnowledgeKind.Term)) {
      return;
    }
    for (const user of users) {
      user.followReplacement(replaced.key, replacement.key);
    }
  }
}
