# Member is its own aggregate; the Owner is a property of the Workspace

Member is a separate aggregate that refers to its Workspace and its Account by id, so a Member can be loaded and changed without loading the whole Workspace. A Workspace has exactly one Owner, and it is stored on the Workspace itself, not as a Role on a Member. A single field guarantees "exactly one Owner" by its structure, so neither a domain service nor concurrency protection is needed for it. A Transfer of Ownership is one write to the Workspace.

## Considered Options

- **Member as an entity inside the Workspace aggregate.** Rejected: every Member operation would load and rewrite the Workspace.
- **Owner as a Role on Member, with the rule enforced in a domain service.** Rejected: the database cannot stop two Members from both being Owner, whether through a race or a direct `changeRole` call, and a Transfer of Ownership would change two aggregates.
- **Several Owners with "at least one Owner".** Rejected in favour of a single, clearly responsible Owner.

## Consequences

- The Owner is also a Member, so they appear in the Member list and can work in Projects.
- Rules that span a Workspace and a Member live in domain services, not in either aggregate. `OwnershipTransferService` allows a Transfer of Ownership only to an Active Member of the same Workspace, and the Member who owns the Workspace cannot leave or be removed.
- Creating a Workspace also creates its Owner's Member: two aggregates in one operation, done by `WorkspaceCreationService`.
