# Workspace — open questions and deferred ideas

## Open questions

- **Email verification in IAM.** Only an Account with the invited email can accept an Invitation, but IAM does not verify email ownership yet. Until it does, someone can register with another person's email and accept their Invitation if the link leaks.

## Deferred (post-MVP)

- **Soft delete of Workspace.** MVP deletes a Workspace and everything in it immediately. Later: mark it Deleted, allow an Owner to restore it within 30 days, then delete permanently.
- **Per-Project access.** MVP: every Member sees every Project. Later: Projects with their own list of Members.
- **Email delivery for Invitations.** MVP: an Owner copies the Invitation link and sends it themselves. Later: send it by email through an adapter.
- **Personal Access Token limited to Projects.** MVP: a Personal Access Token reaches every Project in its Workspace, and tools take the Project Slug. Later: when creating a token, choose "all Projects" (future ones included) or "only these", like GitHub fine-grained tokens.
- **Permissions model.** Decided on 2026-09-29: Workspace Roles Owner (several allowed) and Manager, Project Roles Viewer / Contributor / Maintainer, all fixed by Intentra (see ADR 0002 and the glossary). Custom Roles per Workspace only if customers ask for them.
- **Slug availability check.** MVP: the client submits the Workspace and, on `WORKSPACE_SLUG_TAKEN` (409), retries with the next suffix (`acme-corp-2`). Later: a query that tells whether a slug is free, likely as a GraphQL field.
- **Member email sync.** A Member keeps a copy of its Account's email, taken from the Actor on joining. IAM cannot change an email yet; once it can, Workspace should update the copy from an IAM event.
- **Workspace deletion across contexts.** Settled by `docs/adr/0001-knowledge-and-agents-are-subdomains-of-workspace.md`: Knowledge and Agents are subdomains of Workspace, and `Cleanup` removes what lies under a deleted Workspace or Project in the same transaction. A context outside Workspace that one day keeps data per Project would still need a published event.
- **Inviting an email two Members share.** Sending an Invitation looks the invitee up by email. If two Members of the Workspace share an email (a Removed one and an Active one, from different Accounts), the lookup may pick the Removed one and let the Owner invite someone already Active; accepting then fails with `ALREADY_WORKSPACE_MEMBER`, so no data goes wrong. Fix when it shows up: look for an Active Member first.
- **Recording a Personal Access Token's last use.** Every MCP request writes `lastUsedAt` in a transaction of its own, so parallel requests with one token conflict and retry. Later: write it at most once a minute.
