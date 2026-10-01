# IAM

Who a person is in Intentra and how they prove it.

## Language

**Account**:
A person's login in Intentra, identified by an email and protected by a password. An Account exists on its own, without any Workspace. It has a name, given at sign-up and changeable by its owner.
_Avoid_: User, Profile

**Actor**:
The Account authenticated in the current request, on whose behalf an action is performed.
_Avoid_: Caller, Principal, Current user

**Platform Admin**:
An Account that runs Intentra itself rather than any one Workspace: it designs Intentra's Agents and manages Workspaces and Accounts across the platform. It is a mark on the Account, not a Role in a Workspace, so a Platform Admin may also be an Owner or Member of Workspaces and has no extra rights inside them because of it. Across the platform it sees only what describes a Workspace from outside (its Owners, how many Members and Projects it has, whether it has a Provider Key, its Usage), never what is inside it: no Projects' knowledge and no Conversations. Platform Admins are appointed and removed only outside the app, never from inside it.
_Avoid_: Admin, Superadmin, Operator, Staff

**Open Sign-up**:
Whether anyone may create an Account. A Platform Admin turns it on and off; it is off until one turns it on. While it is off, only someone with a pending Invitation to some Workspace may sign up, with the email the Invitation was sent to; everyone else is refused.
_Avoid_: Registration, Public sign-up, Invite-only mode

**Blocked Account**:
An Account a Platform Admin has blocked, until a Platform Admin unblocks it. It cannot sign in, and blocking it revokes the Personal Access Tokens of its Members in every Workspace for good: unblocking does not bring them back. Its Members themselves stay as they were. A Platform Admin is never blocked, and an Account made the Platform Admin is unblocked.
_Avoid_: Banned, Suspended (that is a Workspace), Disabled
