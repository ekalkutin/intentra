import { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { KnowledgeKind } from '../value-objects/index.js';

/**
 * What a Member may do with a Project's knowledge, on top of Tenancy's
 * Project Roles. Every verdict is given the Kind (or the item, which has one),
 * so that owners per Kind can be added later without changing the callers.
 * That only a Draft changes is the Knowledge Item's own rule, not a right.
 */
export class KnowledgePolicyService {
  public canRecordDraft(
    projectRole: ProjectRole,
    _kind: KnowledgeKind,
  ): boolean {
    return this.#canWrite(projectRole);
  }

  public canEditDraft(projectRole: ProjectRole, _item: KnowledgeItem): boolean {
    return this.#canWrite(projectRole);
  }

  public canDeleteDraft(
    projectRole: ProjectRole,
    _item: KnowledgeItem,
  ): boolean {
    return this.#canWrite(projectRole);
  }

  public canApproveDraft(
    projectRole: ProjectRole,
    _item: KnowledgeItem,
  ): boolean {
    return projectRole.equals(ProjectRole.Maintainer);
  }

  public canRejectDraft(
    projectRole: ProjectRole,
    _item: KnowledgeItem,
  ): boolean {
    return projectRole.equals(ProjectRole.Maintainer);
  }

  #canWrite(projectRole: ProjectRole): boolean {
    return (
      projectRole.equals(ProjectRole.Contributor) ||
      projectRole.equals(ProjectRole.Maintainer)
    );
  }
}
