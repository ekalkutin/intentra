---
version: 1
slug: "src-pages-platform-agents"
primary_target: "src/pages/platform-agents"
related_targets: ["src/widgets/app-shell","src/pages"]
---

# Platform admin: Agents

Mode: Operate. Scope (step 1 of the admin area): the `/platform` section for the one Platform Admin: Agents, Intentra's own Skills, built-in Model Profiles, the changes against the Published Agents with what keeps them from publishing, and publishing with a note. Later steps: history of Agents Versions, Workspaces, Accounts, Open Sign-up, Usage. Audience: the Platform Admin, a technical person tuning prompts, tools and models; visits are rare but long (editing a prompt of hundreds of lines). Real API data only (`/api/platform/agents`); the server's verdicts, never re-derived rules.

User decisions (2026-10-01, one question at a time): the section's pages are a sidebar group "Платформа" in the common sidebar, seen only by a Platform Admin, and a group in ⌘K (revised the same day: first built as a sidebar of its own, the user asked for one sidebar); an Agent is edited on its own page with the text on the left and a properties column on the right, explicit save, asking before leaving unsaved changes; a Skill gets the same page; a Model Profile is edited in a dialog; publishing problems come with `GET …/unpublished/changes` (structured codes), shown before publishing.

## Direction contract

THESIS: the same category-standard shell switched into an admin mode, where a prompt is a document worth a page and every object shows whether it differs from what Workspaces run. Refuses a settings form dump and dashboard tiles.

OWN-WORLD: inherited from DESIGN.md unchanged: grey frame, inset ringed canvas, bordered lists with hairline rows, near-black primary, indigo only for focus, statuses as icon plus word, Geist with Geist Mono for tool ids, Skill names, model ids, version numbers and counts.

STORY: the Platform Admin opens Агенты from the sidebar's Платформа group, sees the Agents with marks for what is new or changed since the published version, opens one, edits its instructions beside its model, tools, Skills and Specialists, saves, then goes to Changes, reads what differs and what blocks, writes a note and publishes the next version.

FIRST VIEWPORT: the common sidebar with a third group "Платформа" (Агенты, Skills, Модели, Изменения with a mono count) under Работа and Пространство, which stay on the last Workspace. Canvas: page title "Агенты", one line "Опубликована версия N" or "Ничего не опубликовано", primary "Новый агент" right; one bordered list, Orchestrator first, each row the name (500), description muted on one line, meta the Model Profile and tool count, a change mark (Новый / Изменён) as icon plus word.

FORM: canon (standing exit, inherited from the app shell brief, seed key a150ca9d); no surface roll, structure pinned by the user.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- History of Agents Versions and republishing, Workspaces, Accounts, Open Sign-up: next steps.
