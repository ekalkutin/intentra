# IAM

Who a person is in Intentra and how they prove it.

## Language

**Account**:
A person's login in Intentra, identified by an email and protected by a password. An Account exists on its own, without any Workspace.
_Avoid_: User, Profile

**Actor**:
The Account authenticated in the current request, on whose behalf an action is performed.
_Avoid_: Caller, Principal, Current user

**Platform Admin**:
An Account that runs Intentra itself rather than any one Workspace: it designs Intentra's Agents and manages Workspaces and Accounts across the platform. It is a mark on the Account, not a Role in a Workspace, so a Platform Admin may also be an Owner or Member of Workspaces and has no extra rights inside them because of it. Across the platform it sees only what describes a Workspace from outside (its Owners, how many Members and Projects it has, whether it has a Provider Key, its Usage), never what is inside it: no Projects' knowledge and no Conversations. Platform Admins are appointed and removed only outside the app, never from inside it.
_Avoid_: Admin, Superadmin, Operator, Staff

**Blocked Account**:
An Account a Platform Admin has blocked, until a Platform Admin unblocks it. It cannot sign in, and blocking it revokes the Personal Access Tokens of its Members in every Workspace for good: unblocking does not bring them back. Its Members themselves stay as they were.
_Avoid_: Banned, Suspended (that is a Workspace), Disabled
