import { Member, Workspace } from '../entities/index.js';
import { MemberId } from '../value-objects/index.js';

export class WorkspaceCreationService {
  public create(props: WorkspaceCreationProps): WorkspaceCreation {
    const ownerId = new MemberId();
    const workspace = Workspace.create({
      name: props.name,
      slug: props.slug,
      ownerId: ownerId.value,
    });
    const owner = Member.createOwner({
      id: ownerId.value,
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
