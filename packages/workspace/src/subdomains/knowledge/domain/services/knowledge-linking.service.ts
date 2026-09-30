import { KnowledgeItem } from '../entities/index.js';
import {
  InvalidLinkException,
  LinkTargetNotCurrentException,
  LinkTargetNotFoundException,
} from '../exceptions/index.js';
import type { KnowledgeLink } from '../value-objects/index.js';

export class KnowledgeLinkingService {
  /**
   * Every Link leads to an existing item of a kind its type allows, and to a
   * current one: a Draft or an Approved item, never a Rejected or Obsolete one.
   */
  public ensureLinkable(
    links: readonly KnowledgeLink[],
    targets: readonly KnowledgeItem[],
  ): void {
    for (const link of links) {
      const target = targets.find(item => item.key.equals(link.target));
      if (!target) {
        throw new LinkTargetNotFoundException();
      }
      if (!link.type.allowsTarget(target.kind)) {
        throw new InvalidLinkException();
      }
      if (!target.isDraft() && !target.isApproved()) {
        throw new LinkTargetNotCurrentException(
          target.supersededByKey?.value ?? null,
        );
      }
    }
  }
}
