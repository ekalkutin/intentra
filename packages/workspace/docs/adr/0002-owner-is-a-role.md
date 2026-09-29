# The Owner is a Role on Member

Supersedes the Owner part of ADR 0001. Once Workspaces got a second Role (Manager), keeping the Owner on the Workspace meant two places to check permissions: the Workspace for the Owner, the Member for everything else. The Owner is now a Role on Member, like Manager, and the Workspace has no Owner field.

A Workspace may also have several Owners, which ADR 0001 rejected in favour of a single responsible Owner: in a company, one person owning everything is a single point of failure. The rule is now "at least one Owner": the last Owner cannot leave, be removed or lose the Role. Checking it means counting the Workspace's Owners, and two transactions that each take the Owner Role from a different Member would both see another Owner and leave none. Such changes must therefore also write the Workspace document in the same transaction (`UnitOfWork`), so that concurrent ones conflict and one of them is retried.

## Consequences

- Creating a Workspace creates its first Member with the Owner Role.
- There is no separate Transfer of Ownership: ownership moves by giving another Member the Owner Role and then giving up one's own.
