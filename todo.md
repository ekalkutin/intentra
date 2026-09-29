# TODO

Where we stopped on 2026-09-29. Glossary: `CONTEXT-MAP.md`, `packages/iam/CONTEXT.md`, `packages/workspace/CONTEXT.md`, `packages/agents/CONTEXT.md`, `packages/knowledge/CONTEXT.md`. Decisions: `packages/workspace/docs/adr/`, `packages/agents/docs/adr/`, `packages/knowledge/docs/adr/`. Deferred ideas and tech debt: `docs/notes/workspace-open-questions.md`, `docs/notes/iam-open-questions.md`, `docs/notes/agents-open-questions.md`, `docs/notes/knowledge-open-questions.md`, `docs/notes/knowledge-kinds.md`.

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
- [x] Gateway errors are classes too: `GatewayException` → `ValidationFailedException`, `UnauthenticatedException`, `InternalException` (`libs/gateway/src/presentation/rest/errors/`)

## Next, in this order

Decided on 2026-09-29, see `packages/workspace/CONTEXT.md` and `packages/workspace/docs/adr/0002-owner-is-a-role.md`.

- [x] **Owner as a Role on Member.** `Role` = Owner or none (`Member.role` is null), `Workspace.ownerId` removed, `MemberDto.role` replaces `isOwner`. Several Owners allowed; the last one cannot leave or be removed (409 `LAST_OWNER_CANNOT_LEAVE`). Owner-changing writes call `WorkspaceRepository.lock` in the same `UnitOfWork`.
- [x] **Change a Member's Role**: `PUT /api/workspaces/:workspaceId/members/:memberId/role` with `{ role: 'owner' | null }` (any Owner, any Active Member, own Role included; 409 `LAST_OWNER_CANNOT_STEP_DOWN`). `RoleChangeService` replaced `OwnershipTransferService`; `POST /transfer-ownership` is gone
- [x] **Manager**: `Role.Manager` (`role: 'manager'`). Owner or Manager creates a Project (403 `PROJECT_CREATION_FORBIDDEN`); Owner deletes any Project, Manager only the ones they created (403 `PROJECT_DELETION_FORBIDDEN`)
- [x] **Project Roles** Viewer / Contributor / Maintainer, stored as `ProjectRoleAssignment` (no assignment = Viewer; an Owner is always Maintainer, 409 `OWNER_PROJECT_ROLE_FIXED`). The creator gets Maintainer. `GET /api/workspaces/:workspaceId/projects/:projectId/roles` (any Member) and `PUT …/roles/:memberId` with `{ role }` (Owner or the Project's Maintainer, 403 `PROJECT_ROLE_CHANGE_FORBIDDEN`). Assignments are deleted with their Member (leave / remove), Project and Workspace
- [ ] **Personal Access Token** in the Workspace context: create / list own / revoke (Member), list all / revoke any (Owner); level Viewer / Contributor / Maintainer; expiry 30 / 90 (default) / 365 days / never; last use; secret shown once. MCP handler authenticates by PAT and puts the Actor and the effective level into the tools' request context (see `docs/notes/mastra-request-context-schema.md`)

## Open questions left unanswered


