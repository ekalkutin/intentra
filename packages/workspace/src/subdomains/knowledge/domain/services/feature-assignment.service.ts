import type { Member, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  DependenciesNotApprovedException,
  FeatureAssignmentForbiddenException,
  InvalidLinkException,
} from '../exceptions/index.js';
import {
  KnowledgeKind,
  type KnowledgeItemVersion,
} from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class FeatureAssignmentService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /**
   * A Maintainer puts Approved items into an Approved Feature, moves them
   * there from another, or takes them out of theirs (`feature` null), all or
   * nothing, with no Supersession: the items keep their Knowledge Keys.
   */
  public assign(
    assigner: Member,
    projectRole: ProjectRole,
    items: readonly SeenKnowledgeItem[],
    feature: KnowledgeItem | null,
  ): void {
    for (const { item } of items) {
      if (!this.#knowledgePolicyService.canAssignToFeature(projectRole, item)) {
        throw new FeatureAssignmentForbiddenException();
      }
    }
    if (feature && !feature.kind.equals(KnowledgeKind.Feature)) {
      throw new InvalidLinkException();
    }
    if (feature && !feature.isApproved()) {
      throw new DependenciesNotApprovedException([feature.key.value]);
    }
    for (const { item, seenVersion } of items) {
      item.assignToFeature(assigner.id, seenVersion, feature?.key ?? null);
    }
  }
}

/** An item and the version the Member saw. */
export type SeenKnowledgeItem = {
  readonly item: KnowledgeItem;
  readonly seenVersion: KnowledgeItemVersion;
};
