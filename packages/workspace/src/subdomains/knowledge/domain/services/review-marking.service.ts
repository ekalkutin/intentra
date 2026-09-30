import { KnowledgeItem } from '../entities/index.js';

export class ReviewMarkingService {
  /**
   * An item was rejected, superseded or retired: whatever depends on it or is
   * justified by it may no longer be true. Only its direct sources are
   * marked; the mark goes further only when one of them changes in turn.
   */
  public markSources(
    changed: KnowledgeItem,
    sources: readonly KnowledgeItem[],
  ): void {
    for (const source of sources) {
      if (source.restsOn(changed.key)) {
        source.markForReview(changed.key);
      }
    }
  }
}
