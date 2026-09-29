# TODO

Where we stopped on 2026-09-29. Glossary: `CONTEXT-MAP.md`, `packages/iam/CONTEXT.md`, `packages/workspace/CONTEXT.md`. Decisions: `packages/workspace/docs/adr/`. Deferred ideas and tech debt: `docs/notes/workspace-open-questions.md`, `docs/notes/iam-open-questions.md`.

## Done

- [x] Workspace domain: Workspace, Member (own aggregate), Owner as a Workspace property, `WorkspaceCreationService`, `OwnershipTransferService`
- [x] IAM: sign-in, refresh, `GET /api/iam/me`, `ActorGuard` + `@CurrentActor()`, global `ExceptionsFilter`
- [x] `POST` / `GET /api/workspaces`
- [x] `POST` / `GET /api/workspaces/:workspaceId/projects` (Owner only creates; outsiders get 404)
- [x] `AccessResolver` for Workspace-scoped use cases
- [x] `UnitOfWork` (MongoDB replica set + transactions): every write runs inside `UnitOfWork.run`, a write outside it throws `NoUnitOfWorkException`
- [x] **Invitation**: Owner invites / lists / revokes (`/api/workspaces/:workspaceId/invitations`); invitee lists, opens, accepts, declines (`/api/invitations`). A Member keeps a copy of its Account's email; `Email` VO moved to shared-kernel
- [x] `GET /api/workspaces/:workspaceId/members`: any Active Member sees the Active Members, sorted by email, with `isOwner`
- [x] `DELETE /api/workspaces/:workspaceId/members/:memberId` (Owner) and `POST /api/workspaces/:workspaceId/leave` (any Member); the Owner can neither leave nor be removed (`MemberRemovalService`, 409 `OWNER_CANNOT_LEAVE`)
- [x] `DELETE /api/workspaces/:workspaceId` with `{ slug }` to confirm (Owner only, 400 `WORKSPACE_SLUG_MISMATCH`): deletes Members, Invitations and Projects in one transaction
- [x] `POST /api/workspaces/:workspaceId/transfer-ownership` with `{ memberId }` (Owner only, to an Active Member; the former Owner stays a Member)
- [x] `DELETE /api/workspaces/:workspaceId/projects/:projectId` with `{ slug }` to confirm (Owner only). No renaming of Workspaces or Projects: names are chosen at creation

## Next, in this order


## Open questions left unanswered

- [ ] **Sign-in timing.** Sign-in answers faster for an unknown email (no password hash is checked), which hints whether an email is registered. Fix now with a dummy hash check, or add to `docs/notes/iam-open-questions.md`?
- [ ] **String codes in the gateway filter.** `VALIDATION_FAILED`, `UNAUTHENTICATED`, `INTERNAL` are string literals in `libs/gateway/src/presentation/rest/errors/wire-error.ts`. Keep them, or turn them into gateway exception classes?
