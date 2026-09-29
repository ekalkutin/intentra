# The client shows the policy's verdict through an access DTO

The UI must offer only what the server will allow, and whether a Member may do something is decided only by a domain policy (Tenancy's `AccessPolicyService`, Knowledge's `KnowledgePolicyService`). So the server sends the verdicts, not the facts behind them: each is a `can…` field of an `…AccessDto` that an application mapper fills from the same policy method the domain services use to refuse, named after that method rather than after a button. Verdicts sit apart from the data they concern: `WorkspaceAccessDto` and `ProjectAccessDto` in `GET /workspaces/:id/access`, and for things too many for one answer, an `access` field next to the data, such as `KnowledgeItemDto.access` (`KnowledgeItemAccessDto`) and the `KnowledgeAccessDto` on a list of a Project's knowledge.

## Considered Options

- **Facts, with the client mirroring the policy** (x-lance ADR 0018: the server sends permission codes once, the client names its `can()` checks exactly as the server does). Rejected: x-lance's facts are permission codes from a catalog, so a client check is a lookup. We have fixed Roles and Project Roles and no catalog, so our facts would be Roles, and the client would have to know that a Contributor records and only a Maintainer approves: the business rules would live a second time, outside the domain, in another repository.
- **Flags on the entity DTO itself** (GitHub's `viewerCanUpdate`). Rejected: it mixes what a thing is with what the caller may do with it, unlike the separate `ProjectAccessDto` we already had.
- **One endpoint with a subdomain's flags by Kind** (`GET …/knowledge/access`). Rejected: a verdict that depends on the item, such as approving only a Draft, cannot be given without the item, so the client would still compute.

## Consequences

- A new rule is a new policy method, one refusal in the domain service and one `can…` field in the access DTO beside the thing it is about; never a check in a service or in the client.
- The set of fields follows the actions on an aggregate, not the screens, which answers x-lance's objection that flags grow with the interface.
- A subdomain exposes its own verdicts; Tenancy's `WorkspaceAccessDto` never learns about Knowledge or Agents.
