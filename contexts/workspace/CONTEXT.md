# Workspace

Owns the workspace, the top-level space a team works in and the boundary its data never leaves, who belongs to it and with what role, and the projects created inside it.

## Language

**Workspace**:
The top-level space of a team and the tenant: every piece of data belongs to exactly one workspace and never references data of another.
_Avoid_: Organization, Portfolio, Tenant, Account

**Project**:
A product or initiative inside a workspace, with its own artifacts, members, integrations and agents. Always belongs to exactly one workspace.
_Avoid_: Product, Initiative

**Member**:
An account's participation in one workspace, together with its role there. The same account can be a member of many workspaces with a different role in each.
_Avoid_: User, Participant, Seat
