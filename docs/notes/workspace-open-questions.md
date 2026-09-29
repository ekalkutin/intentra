# Workspace — open questions and deferred ideas

## Open questions

- **Email verification in IAM.** Only an Account with the invited email can accept an Invitation, but IAM does not verify email ownership yet. Until it does, someone can register with another person's email and accept their Invitation if the link leaks.

## Deferred (post-MVP)

- **Soft delete of Workspace.** MVP deletes a Workspace and everything in it immediately. Later: mark it Deleted, allow an Owner to restore it within 30 days, then delete permanently.
- **Per-Project access.** MVP: every Member sees every Project. Later: Projects with their own list of Members.
- **Email delivery for Invitations.** MVP: the Owner copies the Invitation link and sends it themselves. Later: send it by email through an adapter.
- **Personal Access Token limited to Projects.** MVP: a Personal Access Token reaches every Project in its Workspace, and tools take the Project Slug. Later: when creating a token, choose "all Projects" (future ones included) or "only these", like GitHub fine-grained tokens.
- **Configurable Project permissions.** MVP: only an Owner creates and deletes Projects. Later: a dedicated permission that lets a Member create Projects and delete the ones they created.
- **Permissions model.** MVP: the only Role is Contributor, and ownership is a property of the Workspace. Next step: fixed Roles that each carry a set of permissions. Custom Roles per Workspace only if customers ask for them.
- **Slug availability check.** MVP: the client submits the Workspace and, on `WORKSPACE_SLUG_TAKEN` (409), retries with the next suffix (`acme-corp-2`). Later: a query that tells whether a slug is free, likely as a GraphQL field.
- **Member email sync.** A Member keeps a copy of its Account's email, taken from the Actor on joining. IAM cannot change an email yet; once it can, Workspace should update the copy from an IAM event.
- **Workspace deletion across contexts.** Deleting a Workspace deletes its Projects inside the Workspace context only. Once other contexts keep data per Project, they must learn about it, most likely from a published event.
