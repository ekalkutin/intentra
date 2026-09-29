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
- [x] **Owner as a Role on Member.** `Role` = Owner or none (`Member.role` is null), `Workspace.ownerId` removed, `MemberDto.role` replaces `isOwner`. Several Owners allowed; the last one cannot leave or be removed (409 `LAST_OWNER_CANNOT_LEAVE`). Owner-changing writes call `WorkspaceRepository.lock` in the same `UnitOfWork`.
- [x] **Change a Member's Role**: `PUT /api/workspaces/:workspaceId/members/:memberId/role` with `{ role: 'owner' | null }` (any Owner, any Active Member, own Role included; 409 `LAST_OWNER_CANNOT_STEP_DOWN`). `RoleChangeService` replaced `OwnershipTransferService`; `POST /transfer-ownership` is gone
- [x] **Manager**: `Role.Manager` (`role: 'manager'`). Owner or Manager creates a Project (403 `PROJECT_CREATION_FORBIDDEN`); Owner deletes any Project, Manager only the ones they created (403 `PROJECT_DELETION_FORBIDDEN`)
- [x] **Project Roles** Viewer / Contributor / Maintainer, stored as `ProjectRoleAssignment` (no assignment = Viewer; an Owner is always Maintainer, 409 `OWNER_PROJECT_ROLE_FIXED`). The creator gets Maintainer. `GET /api/workspaces/:workspaceId/projects/:projectId/roles` (any Member) and `PUT …/roles/:memberId` with `{ role }` (Owner or the Project's Maintainer, 403 `PROJECT_ROLE_CHANGE_FORBIDDEN`). Assignments are deleted with their Member (leave / remove), Project and Workspace
- [x] **Personal Access Token** in the Workspace context: `POST` / `GET /api/workspaces/:workspaceId/personal-access-tokens` and `DELETE …/:tokenId` (own tokens; an Owner sees and revokes all). `{ name, level, lifetimeDays: 30 | 90 | 365 | null }`, 90 by default; the `intr_…` secret (the list shows a hint such as `intr_…x7Qa`) is shown once and stored as SHA-256; revoking deletes it; last use is recorded. Deleted with its Member (leave / remove) and Workspace. `/api/mcp` requires `Authorization: Bearer intr_…` (401 `INVALID_PERSONAL_ACCESS_TOKEN`) and puts `caller` (`actor`, `workspaceId`, `level`) next to `apis` in the tools' request context. Still open: capping `level` by the Member's Project Role in each Project, once a tool works with a Project

## Next, in this order: Project Knowledge up to the full model

Goal: the whole model in `packages/knowledge/CONTEXT.md` (option C), built in steps of about 1 000–1 500 lines each (half of it tests), one commit per step with green tests, so each one can be reviewed. Each step starts with a short grilling on its open decisions; answers go to the glossary, ADRs or `docs/notes/knowledge-kinds.md`. Glossary: `packages/knowledge/CONTEXT.md`, ADR `packages/knowledge/docs/adr/0001-one-knowledge-item-aggregate.md`, fields: `docs/notes/knowledge-kinds.md`.

- [ ] **1. Knowledge Item frame and first Kinds.** New `packages/knowledge` (module, database, contracts `KnowledgeApi`, gateway controller). Knowledge Item with the common frame: Kind, Knowledge Key, title, description, status (Draft only for now), Source with Rationale (by hand for now), author. Kinds Term, Requirement, Decision with their fields. REST: record a Draft, edit a Draft, get one, list a Project's knowledge (Drafts marked, Rejected left out). Any Active Member of the Workspace for now.
  - Decide: how Knowledge Keys are handed out per Project and Kind (counter, never reused, gaps normal); how the Kind's fields are stored and validated (discriminated union in contracts and domain); REST paths; how Knowledge learns that the Project exists and the caller is its Member (Workspace API)
- [ ] **2. Approve and Reject.** Draft → Approved or Rejected (optional reason); who and when recorded; an Approved item is never edited. One permission check given the Member, the Project and the Kind, backed by the Workspace's `AccessPolicyService`: Maintainer approves, rejects; Contributor and Maintainer record and edit Drafts; Viewer only reads.
  - Decide: what Workspace publishes for it (the caller's Project Role, or answers such as `canApprove`); whether Rejected can be listed on request
- [ ] **3. Deleting a Project or Workspace reaches Knowledge.** Knowledge Items go with their Project, and with their Workspace.
  - Decide: direct call between contexts or a published event, inside or after the Workspace transaction
- [ ] **4. Remaining Kinds.** Product Overview (one Approved per Project), Goal, Persona, Scenario (performer comes with Links, step 7), Constraint, Business Rule, Integration, Open Question.
- [ ] **5. MCP tools for external agents.** Read a Project's knowledge (Approved only, or with Drafts marked), get one item, record a Draft per Kind (typed tools generated from the Kind schemas, Source = external agent with Rationale), approve / reject only with a Maintainer-level token. In each Project the agent may do what the lower of the token's level and the Member's Project Role allows. Tool context via Mastra `requestContextSchema` (`docs/notes/mastra-request-context-schema.md`).
  - Decide: tool names and granularity (one `record_draft` with a Kind union, or one tool per Kind as ADR 0001 suggests); how the agent names the Project (slug)
- [ ] **6. Supersession and Retirement.** Obsolete status; Supersession approves a new item of the same Kind in place of an Approved one (new Key, "superseded by" chain); Retirement marks an Approved item Obsolete; both Maintainer only, also over MCP. Obsolete left out of searches, reachable by id and through the chain.
- [ ] **7. Links.** depends on, uses term, justified by, answers, conflicts with; recorded and approved with the item they start from. An item is approved only once everything it depends on is Approved, or together with those Drafts in one step. Scenario's performer as a `depends on` Link to a Persona. An Open Question is answered once an Approved item `answers` it.
  - Decide: what "approve together" looks like in the API; what happens to Links whose target is Rejected or Obsolete
- [ ] **8. Needs Review.** Marked when an item it depends on is superseded, retired or rejected; shown in searches; cleared by confirming, by editing or rejecting a Draft, or by a Supersession or Retirement.
  - Decide: does the mark spread further than one step along `depends on`

## Open questions left unanswered


