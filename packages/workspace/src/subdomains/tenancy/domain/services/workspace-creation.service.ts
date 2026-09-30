import { Member, Workspace } from '../entities/index.js';

export class WorkspaceCreationService {
  public create(props: WorkspaceCreationProps): WorkspaceCreation {
    const workspace = Workspace.create({ name: props.name, slug: props.slug });
    const owner = Member.createOwner({
      workspaceId: workspace.id.value,
      accountId: props.accountId,
      email: props.email,
    });

    return { workspace, owner };
  }
}

type WorkspaceCreationProps = {
  readonly name: string;
  readonly slug: string;
  readonly accountId: string;
  readonly email: string;
};
type WorkspaceCreation = {
  readonly workspace: Workspace;
  readonly owner: Member;
};
