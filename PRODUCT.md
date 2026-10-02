# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A software team working on one product together, with no single role taking priority: product people and analysts who describe what is being built, tech leads and architects who shape it and approve what gets recorded, and developers who read it and connect their coding agents to it. Screens must serve all of them equally. Some pages are also read by people outside engineering, such as clients or stakeholders (see the Product Passport in `docs/product-documentation-model.md`).

The core job: turn product knowledge that lives in chats, in people's heads and in scattered docs into one structured, current model of the Project, and keep it current as the product changes.

## Product Purpose

Intentra is an AI analyst for a software product. People talk with Intentra about what they are building; it interviews them, checks what they say against what is already known, points out gaps and contradictions, and records what it learns as Drafts. People review the Drafts and approve or reject them. The approved knowledge is the single source of truth: the Product Passport is a view of it, and external coding agents read it over MCP, task by task, as a Context Pack.

Success: a team and its coding agents answer "what are we building, why, how should it work, and what has already been decided?" from Intentra instead of reconstructing it every time, and the answer holds together because Intentra keeps checking it.

Sources: `docs/product-brief.md`, `docs/product-documentation-model.md`.

## Positioning

First of all an AI analyst (decided 2026-10-02): a companion in describing requirements and functionality that finds what is missing, unclear or contradictory, while every decision stays with a person. Equally, the knowledge layer between people and AI developers: one canonical, linked model of Knowledge Items, each with a status, a source, an author and its Links, from which the Passport and the agents' context are drawn. The AI may propose knowledge but never approves it. Only a person approves.

## Operating Context

- Structure: Workspace (top level; never "Organization") → Project → Knowledge. Members hold a Workspace Role (Owner, Manager or none) and a Project Role (Viewer, Contributor or Maintainer).
- Knowledge Items have one of 11 Kinds (Product Overview, Goal, Persona, Scenario, Requirement, Constraint, Term, Business Rule, Integration, Decision, Open Question), a Knowledge Key such as `REQ-12`, a Source with a Rationale (by hand, an external agent over MCP, Intentra in a Conversation, or Intentra in an Analysis Run), Links (depends on, uses term, justified by, answers, concerns, conflicts with) and a lifecycle: Draft → Approved or Rejected; an Approved item is never edited, only replaced (Supersession) or retired, both leaving it Obsolete; what rests on a changed item is marked Needs Review. Contributors record and edit Drafts, Maintainers approve, reject, replace and retire. Writes use optimistic locking: an approval confirms exactly the text the Maintainer read.
- Intentra's own Agents: Intentra, the one people talk to in a Conversation; the Auditor, which carries out Analysis Runs on its own and records what it finds as Open Questions authored by Intentra; Specialists Intentra may call. A Platform Admin designs them and publishes them as Agents Versions; every model call runs on the Workspace's own Provider Key (OpenRouter).
- Analysis: Gaps (what is missing without judgement, computed on the fly) and Analysis Runs (judgement: contradictions, ambiguities, doubtful rules), by hand or every night over what changed.
- There are two equal ways in: the web UI, and external agents (Claude Code, Codex, Cursor) over MCP, authenticated by a Member's Personal Access Token.
- The main loop: a Conversation with Intentra (the interview) → Drafts → human review → Approved knowledge → Analysis Runs keep it consistent → the Passport and the agents' Context Packs.
- The UI shows the server's access-policy verdicts. It does not re-derive permissions (`docs/adr/0002-client-shows-the-policy-verdict.md`).
- Glossaries: `CONTEXT-MAP.md` and the subdomain `CONTEXT.md` files. UI copy uses these terms.

## Capabilities and Constraints

- Built:
  - Sign-up and sign-in, Account names, Open Sign-up, Open Workspace Creation, a Platform Admin from env.
  - Workspaces, Members, Roles, Invitations, Projects, Project Roles, Personal Access Tokens, suspending Workspaces and blocking Accounts.
  - Knowledge in the web UI: views by Kind and status with bulk approval, the item page (fields, Links, history, what it misses, the agent's context), the editor.
  - The Product Passport (8 chapters), the Interview (Conversations with Intentra), Analysis (Gaps, Analysis Runs, the nightly check).
  - MCP: reading (summary, Gaps, list, item, Context Pack, Project Frame) and recording every Kind, approving per token level.
  - The admin area: Agents, Skills, Model Profiles, changes and publishing, Open Sign-up and Open Workspace Creation.
- Planned: Usage, the admin area's history of Agents Versions and its Workspaces and Accounts, importing documents, planning (Feature → Task), document views beyond the Passport (Feature Spec, ADR, user guide). See `todo.md`.
- Stack (existing): `apps/web` is a Vite + React 19 SPA with a Feature-Sliced Design structure (enforced by steiger), RTK Query, react-router, react-hook-form + zod, Tailwind v4, and i18next (`docs/adr/0003-web-ui-is-an-fsd-spa-on-rtk-query.md`).
- Components (binding): use shadcn primitives (style `base-nova`, on Base UI) wherever they fit. Primitives are added through the shadcn CLI into `src/shared/ui/primitives` and are never hand-edited. Anything shadcn does not provide is our own component in `src/shared/ui/components`, built by composing those primitives.
- Language: the UI is Russian now, and English will come later. Every string goes through i18n with no hardcoded copy, and layouts must fit longer English and Russian strings alike.
- Light and dark themes are both supported (a theme switch already exists).
- MVP stage: go for the simplest working thing, with no enterprise hardening. Data-loss risks are the exception and are always handled.

## Brand Commitments

- Name: Intentra. The current mark is a placeholder (a lucide icon in a rounded square, `src/shared/ui/components/brand.tsx`), not a committed logo.
- Visual standard (chosen 2026-09-30): the category standard, played straight. The web UI should sit naturally alongside Linear and Vercel, and their craft level is the bar: calm neutral surfaces, conventional app structure, no decorative metaphor.
- Voice: precise, plain and calm, like an analyst rather than a hype assistant. Use domain terms from the glossary consistently. Undecided: no formal voice guide yet.

## Evidence on Hand

- Product docs: `docs/product-brief.md`, `docs/product-documentation-model.md`, ADRs under `docs/adr/` and each subdomain's `docs/adr/`.
- There are no customers, testimonials, metrics, pricing or case studies. Future work must not invent any.

## Product Principles

1. **People decide, AI proposes.** Every AI contribution is visibly a Draft with a source until a person approves it. The UI never blurs proposed and approved knowledge.
2. **One model, many views.** The Passport, documents and agent context are views of the same Knowledge Items. Show where each statement comes from and what it links to.
3. **Traceable over clever.** Status, author, source, Knowledge Key and version are always reachable. A reader can always tell whether something is current, approved, and why.
4. **Equal for every role.** A product person, an architect and a developer each finish their job without needing another role's vocabulary. Engineering depth is available but not in the way.
5. **Web and MCP are peers.** Anything a person can see or do in the UI has the same meaning for an agent over MCP. The UI never invents concepts the model lacks.
