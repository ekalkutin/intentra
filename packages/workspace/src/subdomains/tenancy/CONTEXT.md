# Tenancy

A subdomain of the Workspace context (see `CONTEXT-MAP.md`): the top-level space in Intentra that groups people and the projects they work on, and who may do what in it.

## Language

**Workspace**:
The top-level space that groups people and projects. It is created explicitly by an Account, never automatically at sign-up. Its name is chosen at creation and cannot be changed later. It is deleted by one of its Owners or by a Platform Admin.
_Avoid_: Organization, Portfolio, Team, Tenant

**Open Workspace Creation**:
Whether any Account may create a Workspace. A Platform Admin turns it on and off; it is off until one turns it on. While it is off, only a Platform Admin creates Workspaces, and everyone else gets one by being invited.
_Avoid_: Self-service workspaces, Public creation

**Workspace Slug**:
A short, globally unique, human-readable handle of a Workspace used in its address. Unlike the name, no two Workspaces share it, and it never changes after the Workspace is created. It becomes free again once the Workspace is deleted.
_Avoid_: Handle, Alias, Subdomain

**Suspended Workspace**:
A Workspace a Platform Admin has suspended, until a Platform Admin resumes it. Its people can still sign in and see everything in it, but nothing in it can be changed: no Knowledge, no Members, Roles or Invitations, no Projects, and no AI works with it: its Agents do not run and external agents cannot reach it over MCP at all. What only takes access away still works: its Owners can delete it, a Member can leave it, and a Personal Access Token can be revoked.
_Avoid_: Blocked, Frozen, Disabled, Banned

**Member**:
An Account's participation in a specific Workspace, with its own Role, Project Roles and status. One Account can be a different Member in each Workspace it belongs to. A Member is Active or Removed; a Removed Member keeps its history but has no access, and loses its Role and all its Project Roles. An Account is at most one Member per Workspace: a Removed Member who accepts a new Invitation becomes Active again, without a Role and a Viewer in every Project.
_Avoid_: User, Participant, Collaborator

**Invitation**:
An Owner's offer for someone to join a Workspace as a Member without a Role. It is addressed to an email, and only an Account with that same email can accept it. On acceptance the invitee becomes a Member. An Invitation is Pending until it is Accepted or Declined by the invitee, Revoked by an Owner, or Expired after 7 days. An email has at most one Invitation per Workspace: inviting it again reopens that Invitation as Pending for another 7 days, with the same link.
_Avoid_: Invite link, Join request

**Project**:
The container for one software product's context inside a Workspace. For now every Member of the Workspace can see every Project in it. A Project records which Member created it. An Owner or a Manager can create a Project; an Owner can delete any Project, a Manager only the ones they created. Its name is chosen at creation and cannot be changed later.

**Project Slug**:
A short, human-readable handle of a Project, unique within its Workspace and never changed after the Project is created. Together with the Workspace Slug it names a Project, e.g. `acme-corp/billing-service`.
_Avoid_: Project key, Handle

**Owner**:
The Role of a Member who owns a Workspace and manages it: its settings, its Members, its Projects and its deletion. A Workspace can have several Owners but always has at least one. The Account that creates a Workspace becomes its first Owner. The last Owner can neither leave nor be removed.
_Avoid_: Admin

**Role**:
What a Member may do in the Workspace beyond being a Member: Owner or Manager. A Member has at most one Role; a Member without one is simply a Member, and is shown as "Member" where Roles are listed. Any Owner can give any Active Member a Role or take it away, including the Owner Role and their own, as long as the Workspace keeps at least one Owner.
_Avoid_: Member (as a role name), Workspace role

**Manager**:
The Role of a Member who may create Projects and delete the Projects they created.
_Avoid_: Staff, Admin, Lead

**Project Role**:
What a Member may do in one particular Project: Viewer, Contributor or Maintainer. The same Member can hold different Project Roles in different Projects; a Member who was given none in a Project is a Viewer there. The Member who creates a Project becomes its Maintainer. An Owner is a Maintainer in every Project, and that cannot be changed while they are an Owner. Project Roles are given and taken away by an Owner or by a Maintainer of that Project. It does not decide who sees a Project, only what they may do in it. Intentra alone defines the Project Roles; a Workspace cannot create its own.
_Avoid_: Project member, Position, Title, Access level

**Viewer**:
The Project Role that only reads the Project's knowledge.
_Avoid_: Reader, Guest

**Contributor**:
The Project Role that reads and records Drafts but cannot approve, reject, supersede or retire.
_Avoid_: Editor, Writer

**Maintainer**:
The Project Role that does everything with the Project's knowledge: reads, records Drafts, approves, rejects, supersedes and retires. A Maintainer also gives and takes away Project Roles in that Project, except an Owner's.
_Avoid_: Approver, Reviewer

**Personal Access Token**:
A secret a Member creates so that an external agent (Claude Code, Codex, Cursor) can work in the Workspace over MCP on that Member's behalf. It belongs to the Member and works only in that Workspace; to work in several Workspaces an agent is given one Personal Access Token per Workspace. It gives access to every Project in the Workspace. It carries a level named like a Project Role, chosen when it is created: Viewer, Contributor or Maintainer. In each Project the agent may do what the lower of the two allows: the token's level or its Member's Project Role there. No level lets an agent manage the Workspace (its Members, Invitations, Projects or settings). It expires after the period chosen when it is created (30 days, 90 days by default, a year, or never) and can be revoked at any time by its Member or by an Owner. Owners see every Personal Access Token in the Workspace (whose it is, its name, level, expiry and last use), but never its secret. It also stops working when its Member leaves or is removed, when the Workspace is deleted, and when its Member's Account is blocked.
_Avoid_: Access Token (that is IAM's sign-in JWT), API key, Agent token. PAT is fine as a short form
