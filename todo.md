# TODO

Plans only (decided 2026-10-03): what is built lives in the code and the git history, what was decided in the glossaries (`CONTEXT-MAP.md` and each `CONTEXT.md`), the ADRs and `docs/notes/`. The order of the sections below is not decided yet.

## Now

- [x] **Try the analyst on dogfooding.** Done on 2026-10-03 over three Projects (`intentra-03-10`, `intentra-2`, `intentra-3`), Gemini 3.8 Flash, agents up to version 10: findings, traps and what was fixed in `docs/notes/dogfood-traps.md`.
- [ ] **Compare models on the dogfood script.** Run the `intentra-3` script (six facts, traps 1–4) on Sonnet 5.5 and Gemini 3.8 Flash: what Gemini keeps doing in spite of the prompt (records a vague statement before asking for a number, fills fields the person never gave, two questions at once, options as text, rationales that are not the person's words) — model or product. Decides the default Model Profile.
- [ ] **Auditor checks Links too.** It finds contradictions in what items say but not a far-fetched Link (a Goal "justified by" a deployment Decision); tune `docs/agents/auditor.md` (in the judge's instructions once the run is a pipeline, see Pilot).
- [ ] **Prompt caching for Claude.** No `cacheControl` is sent: every step of an answer pays for the whole history again on Anthropic models.

- [ ] **Feature.** A new Kind (`FEAT`, capability + out of scope), the `part of` Link, Feature Assignment for Approved items, a Feature as Anchor of a Context Pack, chapter 4 of the Passport by Feature, three Gaps, an interview step for Intentra, the Auditor checking parts against out of scope, a line in `MCP_INSTRUCTIONS`, the parts block on a Feature's page. Decided 2026-10-03: the Knowledge glossary, `packages/workspace/src/subdomains/knowledge/docs/adr/0002-feature-assignment-without-supersession.md`, `docs/notes/knowledge-kinds.md`, `docs/product-documentation-model.md`. Task and Planning come after it.

## Pilot

Decided 2026-10-03: get the product ready for the first outside teams that already have a product; their first value is "Intentra found contradictions in our own materials". Pilot teams get an OpenRouter key with a credit limit from us by hand, no code. Out of scope for now: product analytics of the pilot, email.

- [ ] **Similar Items.** Embeddings of every Knowledge Item (all fields) through OpenRouter on the Provider Key, the model from env; Qdrant as a derived index rebuilt from MongoDB; filled after the fact once a Workspace adds a key. The Provider Key moves where Agents and Knowledge both read it. Glossary: Similar Items in `packages/workspace/src/subdomains/knowledge/CONTEXT.md`; `packages/workspace/src/subdomains/knowledge/docs/adr/0003-similar-items-in-qdrant-as-a-derived-index.md`.
- [ ] **Auditor as a pipeline.** The code walks the Unchecked items, Approved and Drafts, and gives the Auditor one call per group (the item, its Similar Items, its Links, the Open Questions about them); the Auditor has no tools. Each item remembers when a run last looked at it; a run by hand or by schedule takes only the Unchecked ones, a run over the whole Project is a Maintainer's; a run that stops halfway leaves the rest Unchecked; the Analysis page shows "checked X of Y". An Open Question gets Needs Review when an item it concerns is rejected. Glossary: Analysis Run and Unchecked in `packages/workspace/src/subdomains/agents/CONTEXT.md`, Needs Review in the Knowledge glossary; `packages/workspace/src/subdomains/agents/docs/adr/0005-analysis-run-is-driven-by-code-the-auditor-judges.md`.
- [ ] **Benchmark for the Auditor.** A Project from Intentra's own documents (main) and one from a second project's documents (control), with planted traps: contradictions between unlinked items and in fields other than the main one. Measure caught, false findings, tokens and minutes; the old Auditor against the new one. It also serves "Compare models" above.
- [ ] **Similar Items over MCP.** A tool to find them and a line in `MCP_INSTRUCTIONS`: check what is similar before recording.
- [ ] **Similar Items for Intentra when recording.** After the benchmark: every `record_*` / `edit_*` answer carries the Similar Items, so Intentra says at once when the new item duplicates or contradicts one.
- [ ] **Start of an empty Project.** Two ways: "Talk to Intentra" and "Bring in what you have", the latter a ready prompt for Claude Code / Codex / Cursor with the import recipe (read the documents, check Similar Items before recording, link every item) and a link to connecting MCP.
- [ ] **"Needs attention" block** at the top of a Project's knowledge: new findings, Drafts waiting for approval, Needs Review.
- [ ] **English.** The web UI in English through i18n; Intentra talks in the person's language. A Project Language chosen at creation, every recording in it (existing Projects are Russian). Glossary: Project Language in `packages/workspace/src/subdomains/tenancy/CONTEXT.md`.

## Admin area (`/platform`)

- [ ] **History of Agents Versions.** Number, who, when and note; publishing an earlier one again (the API exists: `versions`, `versions/:n`, `versions/:n/republish`).
- [ ] **Workspaces and Accounts.** Lists for a Platform Admin; suspend, resume and delete a Workspace (typing its slug); block and unblock an Account (the API exists under `platform/workspaces` and `platform/accounts`).
- [ ] **Usage.** Tokens of every model call with Workspace, Agent, model and Agents Version; read by a Platform Admin (every Workspace, every Agents Version) and an Owner (their Workspace by Agent and model). Open: a record per model call or per day; whether title generation counts (marked apart); a Platform Admin's calls on the Unpublished Agents (marked `unpublished`); periods as `from` / `to` (30 days by default). Glossary: Usage in `packages/workspace/src/subdomains/agents/CONTEXT.md`.

## Web UI

- [ ] **Keyboard shortcuts.** Decide the set of keys (single letters, modifier chords, or both), one registry that names each once with its keys per platform and its scope, one way of showing them (`Kbd` in tooltips, menus, perhaps a `?` dialog) and one rule for when they stay quiet; then bring ⌘K and ⌘B onto it. What exists and the open questions: `apps/web/docs/notes/keyboard-shortcuts.md`.

## Later

From `docs/product-brief.md`, `docs/product-documentation-model.md` and the deferred notes (`docs/notes/*-open-questions.md`):

- **Planning**: Feature → Task with commit / PR / test evidence, once Features are in use (Feature itself is under Now). Open: whether a Task is knowledge or work.
- **Documents beyond the Passport**: Feature Spec, ADR, user guide, as views of the knowledge.
- **Context for agents**: Anchors found from a task's text; a Feature as Anchor; Gaps marked inside a Context Pack; `scope` for the Project Frame once frames grow past 20–30 items; Context Packs from several Anchors in the web UI.
- **Analysis**: a Workspace's time zone for the nightly check; a Plan and usage limits once Intentra pays for model calls; running the Auditor on the Unpublished Agents for a Platform Admin.
- **Workspace side of the Agents**: the Workspace's own Skills, Model Profiles and Agent Settings.
- **Several API instances**: the one-answer-per-Conversation lock and the nightly scheduler move to MongoDB.
