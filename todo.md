# TODO

Plans only (decided 2026-10-03): what is built lives in the code and the git history, what was decided in the glossaries (`CONTEXT-MAP.md` and each `CONTEXT.md`), the ADRs and `docs/notes/`. The order of the sections below is not decided yet.

## Now

- [ ] **Try the analyst on dogfooding.** On the Project "Intentra": an Analysis Run by hand over its Approved knowledge, the nightly check on, Intentra in an interview with `list_gaps` and `get_context`; note what the Auditor finds, misses and invents, then tune `docs/agents/auditor.md`.

## Admin area (`/platform`)

- [ ] **History of Agents Versions.** Number, who, when and note; publishing an earlier one again (the API exists: `versions`, `versions/:n`, `versions/:n/republish`).
- [ ] **Workspaces and Accounts.** Lists for a Platform Admin; suspend, resume and delete a Workspace (typing its slug); block and unblock an Account (the API exists under `platform/workspaces` and `platform/accounts`).
- [ ] **Usage.** Tokens of every model call with Workspace, Agent, model and Agents Version; read by a Platform Admin (every Workspace, every Agents Version) and an Owner (their Workspace by Agent and model). Open: a record per model call or per day; whether title generation counts (marked apart); a Platform Admin's calls on the Unpublished Agents (marked `unpublished`); periods as `from` / `to` (30 days by default). Glossary: Usage in `packages/workspace/src/subdomains/agents/CONTEXT.md`.

## Web UI

- [ ] **Keyboard shortcuts.** Decide the set of keys (single letters, modifier chords, or both), one registry that names each once with its keys per platform and its scope, one way of showing them (`Kbd` in tooltips, menus, perhaps a `?` dialog) and one rule for when they stay quiet; then bring ⌘K and ⌘B onto it. What exists and the open questions: `apps/web/docs/notes/keyboard-shortcuts.md`.

## Later

From `docs/product-brief.md`, `docs/product-documentation-model.md` and the deferred notes (`docs/notes/*-open-questions.md`):

- **Importing documents**: an existing specification read into Drafts, with an Analysis Run over what came in.
- **Planning**: Feature as a Kind and the natural Anchor of a Context Pack, then Feature → Task with commit / PR / test evidence.
- **Documents beyond the Passport**: Feature Spec, ADR, user guide, as views of the knowledge.
- **Context for agents**: Anchors found from a task's text; a Feature as Anchor; Gaps marked inside a Context Pack; `scope` for the Project Frame once frames grow past 20–30 items; Context Packs from several Anchors in the web UI.
- **Analysis**: a Workspace's time zone for the nightly check; a Plan and usage limits once Intentra pays for model calls; running the Auditor on the Unpublished Agents for a Platform Admin.
- **Workspace side of the Agents**: the Workspace's own Skills, Model Profiles and Agent Settings.
- **Several API instances**: the one-answer-per-Conversation lock and the nightly scheduler move to MongoDB.
