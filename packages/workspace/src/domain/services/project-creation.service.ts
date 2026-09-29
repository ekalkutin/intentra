import { Member, Project, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  ProjectCreationForbiddenException,
} from '../exceptions/index.js';

export class ProjectCreationService {
  public create(
    workspace: Workspace,
    creator: Member,
    props: ProjectCreationProps,
  ): Project {
    if (!creator.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!creator.isActive()) {
      throw new MemberNotActiveException();
    }
    if (!creator.isOwner() && !creator.isManager()) {
      throw new ProjectCreationForbiddenException();
    }

    return Project.create({
      workspaceId: workspace.id.value,
      name: props.name,
      slug: props.slug,
      createdBy: creator.id.value,
    });
  }
}

type ProjectCreationProps = {
  readonly name: string;
  readonly slug: string;
};
