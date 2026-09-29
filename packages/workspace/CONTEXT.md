# Workspace

The top-level space in Intentra that groups people and the projects they work on.

## Language

**Workspace**:
The top-level space that groups people and projects. It is created explicitly by an Account, never automatically at sign-up.
_Avoid_: Organization, Portfolio, Team, Tenant

**Workspace Slug**:
A short, globally unique, human-readable handle of a Workspace used in its address. Unlike the name, no two Workspaces share it, and it never changes after the Workspace is created. It becomes free again once the Workspace is deleted.
_Avoid_: Handle, Alias, Subdomain

**Member**:
An Account's participation in a specific Workspace, with its own role and status. One Account can be a different Member in each Workspace it belongs to. A Member is Active or Removed; a Removed Member keeps its history but has no access. An Account is at most one Member per Workspace: a Removed Member who accepts a new Invitation becomes Active again.
_Avoid_: User, Participant, Collaborator

**Invitation**:
The Owner's offer for someone to join a Workspace as a Contributor. It is addressed to an email, and only an Account with that same email can accept it. On acceptance the invitee becomes a Member. An Invitation is Pending until it is Accepted or Declined by the invitee, Revoked by the Owner, Expired after 7 days, or replaced by a newer Invitation to the same email.
_Avoid_: Invite link, Join request

**Project**:
The container for one software product's context inside a Workspace. For now every Member of the Workspace can see every Project in it. A Project records which Member created it. For now only the Owner can create, rename or delete a Project.

**Project Slug**:
A short, human-readable handle of a Project, unique within its Workspace and never changed after the Project is created. Together with the Workspace Slug it names a Project, e.g. `acme-corp/billing-service`.
_Avoid_: Project key, Handle

**Owner**:
The one Member who owns a Workspace and manages it: its settings, its Members, its Projects and its deletion. Ownership belongs to the Workspace, not to a Role. The Account that creates a Workspace becomes its Owner. Ownership changes only by a Transfer of Ownership, and the Owner can neither leave nor be removed while they own the Workspace.
_Avoid_: Admin, Owner role

**Transfer of Ownership**:
The Owner handing ownership of a Workspace to another Active Member. The former Owner stays in the Workspace as a regular Member.
_Avoid_: Promote, Change owner role

**Role**:
What a Member is allowed to do inside a Workspace's Projects. For now the only Role is Contributor; more will come with permissions.

**Contributor**:
A Role that works inside the Workspace's Projects but manages neither the Workspace nor its Projects.
_Avoid_: Member (as a role name), Editor, User
