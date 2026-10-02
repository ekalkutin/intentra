import { KnowledgeItem } from '../entities/index.js';

export class UnlinkedKnowledgeService {
  /**
   * The Approved items no Context Pack could reach but as its own Anchor: no
   * Link of their own, none from another Approved item, and not of the
   * Project Frame, which agents read whatever it links to. `approved` holds
   * every Approved item of the Project, since a Link from any of them counts.
   */
  public findUnlinked(approved: readonly KnowledgeItem[]): KnowledgeItem[] {
    const targets = new Set(
      approved.flatMap(item => item.links.map(link => link.target.value)),
    );

    return approved.filter(
      item =>
        item.isApproved() &&
        !item.isOfProjectFrame() &&
        item.links.length === 0 &&
        !targets.has(item.key.value),
    );
  }
}
