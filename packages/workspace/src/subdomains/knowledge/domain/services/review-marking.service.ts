import { KnowledgeItem } from '../entities/index.js';
import { KnowledgeKind } from '../value-objects/index.js';

export class ReviewMarkingService {
  /**
   * An item was rejected, superseded or retired: whatever depends on it, is
   * justified by it or is part of it may no longer be true. Only its direct
   * sources are marked; the mark goes further only when one of them changes
   * in turn. A `replacement` that says the same and only adds Links marks
   * nothing: its sources rest on it instead. Nor does any replacement of a
   * Feature: rewording a capability rarely makes its parts untrue, and
   * narrowing its scope is a contradiction for an Analysis Run to find.
   */
  public markSources(
    changed: KnowledgeItem,
    sources: readonly KnowledgeItem[],
    replacement: KnowledgeItem | null = null,
  ): void {
    const same =
      replacement &&
      (changed.kind.equals(KnowledgeKind.Feature) ||
        replacement.onlyAddsLinksTo(changed))
        ? replacement
        : null;
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
