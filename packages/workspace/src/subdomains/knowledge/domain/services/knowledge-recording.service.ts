import type { Member, Project, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import { KnowledgeRecordingForbiddenException } from '../exceptions/index.js';
import type {
  KnowledgeContent,
  KnowledgeSource,
} from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

export class KnowledgeRecordingService {
  readonly #knowledgePolicyService = new KnowledgePolicyService();

  /** A Contributor or Maintainer of the Project records a Draft, by hand or through an agent. */
  public record(
    project: Project,
    author: Member,
    projectRole: ProjectRole,
    props: KnowledgeRecordingProps,
  ): KnowledgeItem {
    if (
      !this.#knowledgePolicyService.canRecordDraft(
        projectRole,
        props.content.kind,
      )
    ) {
      throw new KnowledgeRecordingForbiddenException();
    }

    return KnowledgeItem.record({
      workspaceId: project.workspaceId.value,
      projectId: project.id.value,
      source: props.source,
      number: props.number,
      title: props.title,
      rationale: props.rationale,
      content: props.content,
      authorId: author.id.value,
    });
  }
}

type KnowledgeRecordingProps = {
  readonly source: KnowledgeSource;
  readonly number: number;
  readonly title: string;
  readonly rationale: string | null;
  readonly content: KnowledgeContent;
};
