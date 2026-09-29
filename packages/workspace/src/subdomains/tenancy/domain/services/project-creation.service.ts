import {
  Member,
  Project,
  ProjectRoleAssignment,
  Workspace,
} from '../entities/index.js';
import { ProjectCreationForbiddenException } from '../exceptions/index.js';
import { ProjectRole } from '../value-objects/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class ProjectCreationService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** The creator becomes the new Project's Maintainer. */
  public create(
    workspace: Workspace,
    creator: Member,
    props: ProjectCreationProps,
  ): ProjectCreation {
    creator.ensureActiveIn(workspace.id);
    if (!this.#accessPolicyService.canCreateProjects(creator)) {
      throw new ProjectCreationForbiddenException();
    }

    const project = Project.create({
      workspaceId: workspace.id.value,
      name: props.name,
      slug: props.slug,
      createdBy: creator.id.value,
    });
    const assignment = ProjectRoleAssignment.create({
      workspaceId: workspace.id.value,
      projectId: project.id.value,
      memberId: creator.id.value,
      role: ProjectRole.Maintainer.value,
    });

    return { project, assignment };
  }
}

type ProjectCreationProps = {
  readonly name: string;
  readonly slug: string;
};
type ProjectCreation = {
  readonly project: Project;
  readonly assignment: ProjectRoleAssignment;
};
