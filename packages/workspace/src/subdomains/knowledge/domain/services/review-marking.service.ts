import { KnowledgeItem } from '../entities/index.js';

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
}
