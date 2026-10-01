import { Member, Workspace } from '../entities/index.js';

export class WorkspaceCreationService {
  public create(props: WorkspaceCreationProps): WorkspaceCreation {
    const workspace = Workspace.create({ name: props.name, slug: props.slug });
    const owner = Member.createOwner({
      workspaceId: workspace.id.value,
      accountId: props.accountId,
      email: props.email,
      name: props.ownerName,
    });

    return { workspace, owner };
  }
}

type WorkspaceCreationProps = {
  readonly name: string;
  readonly slug: string;
  readonly accountId: string;
  readonly email: string;
  /** The Account's name, as the Actor carries it. */
  readonly ownerName: string;
};
type WorkspaceCreation = {
  readonly workspace: Workspace;
  readonly owner: Member;
};
