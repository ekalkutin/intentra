import type { Project, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  IntentraRecordingForbiddenException,
  KnowledgeRecordingForbiddenException,
  SupersededItemNotApprovedException,
} from '../exceptions/index.js';
import {
  KnowledgeKind,
  type KnowledgeAuthor,
  type KnowledgeContent,
  type KnowledgeLink,
  type KnowledgeSource,
} from '../value-objects/index.js';

import { KnowledgeLinkingService } from './knowledge-linking.service.js';
import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class KnowledgeRecordingService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();
  readonly #knowledgeLinkingService = new KnowledgeLinkingService();

  /**
   * A Contributor or Maintainer of the Project records a Draft, by hand or
   * through an agent, possibly as the replacement of an Approved item.
   * Intentra itself, in an Analysis Run, records only new Open Questions.
   */
  public record(
    project: Project,
    author: KnowledgeAuthor,
    projectRole: ProjectRole,
    props: KnowledgeRecordingProps,
  ): KnowledgeItem {
    if (
      author.isIntentra() &&
      (!props.content.kind.equals(KnowledgeKind.OpenQuestion) ||
        props.replaced !== null)
    ) {
      throw new IntentraRecordingForbiddenException();
    }
    if (
      !this.#knowledgePolicyService.canRecordDraft(
        projectRole,
        props.content.kind,
      )
    ) {
      throw new KnowledgeRecordingForbiddenException();
    }
    if (props.replaced && !props.replaced.isApproved()) {
      throw new SupersededItemNotApprovedException();
    }
    this.#knowledgeLinkingService.ensureLinkable(
      props.links,
      props.linkTargets,
    );

    return KnowledgeItem.record({
      workspaceId: project.workspaceId.value,
      projectId: project.id.value,
      source: props.source,
      number: props.number,
      title: props.title,
      rationale: props.rationale,
      content: props.content,
      authorId: author.memberId?.value ?? null,
      supersedes: props.replaced?.key ?? null,
      links: props.links,
    });
  }
}

type KnowledgeRecordingProps = {
  readonly source: KnowledgeSource;
  readonly number: number;
  readonly title: string;
  readonly rationale: string | null;
  readonly content: KnowledgeContent;
  /** The Approved item the Draft is to replace, if any. */
  readonly replaced: KnowledgeItem | null;
  readonly links: readonly KnowledgeLink[];
  /** The items its Links lead to. */
  readonly linkTargets: readonly KnowledgeItem[];
};
