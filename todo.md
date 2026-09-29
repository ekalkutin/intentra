# TODO

Where we stopped on 2026-09-29. Glossary: `CONTEXT-MAP.md`, `packages/iam/CONTEXT.md`, `packages/workspace/CONTEXT.md`. Decisions: `packages/workspace/docs/adr/`. Deferred ideas and tech debt: `docs/notes/workspace-open-questions.md`, `docs/notes/iam-open-questions.md`.

## Done

- [x] Workspace domain: Workspace, Member (own aggregate), Owner as a Workspace property, `WorkspaceCreationService`, `OwnershipTransferService`
- [x] IAM: sign-in, refresh, `GET /api/iam/me`, `ActorGuard` + `@CurrentActor()`, global `ExceptionsFilter`
- [x] `POST` / `GET /api/workspaces`
- [x] `POST` / `GET /api/workspaces/:workspaceId/projects` (Owner only creates; outsiders get 404)
- [x] `AccessResolver` for Workspace-scoped use cases

## Next, in this order

- [ ] **Invitation**: Owner invites an email as Contributor; only the Account with that email accepts; Pending → Accepted / Revoked / Expired (7 days); a new Invitation to the same email revokes the old one; cannot invite an existing Member; the Owner copies the link by hand (no email sending). Accepting changes two aggregates, so it hits the transactions tech debt.
- [ ] **List Members** of a Workspace
- [ ] **Remove a Member** (Owner) and **leave a Workspace** (any Member). The Owner can neither leave nor be removed: a domain service, since it spans Workspace and Member.
- [ ] **Rename a Workspace** (`workspace.rename` exists, no use case yet)
- [ ] **Delete a Workspace** immediately, with its Members, Invitations and Projects
- [ ] **Transfer of Ownership** (`OwnershipTransferService` exists, no use case yet)
- [ ] **Rename / delete a Project**

## Open questions left unanswered

- [ ] **Sign-in timing.** Sign-in answers faster for an unknown email (no password hash is checked), which hints whether an email is registered. Fix now with a dummy hash check, or add to `docs/notes/iam-open-questions.md`?
- [ ] **String codes in the gateway filter.** `VALIDATION_FAILED`, `UNAUTHENTICATED`, `INTERNAL` are string literals in `libs/gateway/src/presentation/rest/errors/wire-error.ts`. Keep them, or turn them into gateway exception classes?
