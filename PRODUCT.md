# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A software team working on one product together, with no single role taking priority: product people and analysts who describe what is being built, tech leads and architects who shape it and approve what gets recorded, and developers who read it and connect their coding agents to it. Screens must serve all of them equally. Some pages are also read by people outside engineering, such as clients or stakeholders (see the Product Passport in `docs/product-documentation-model.md`).

The core job: turn product knowledge that lives in chats, in people's heads and in scattered docs into one structured, current model of the Project, and keep it current as the product changes.

## Product Purpose

Intentra is an AI platform that forms, structures and maintains the context of a software project. People talk with Intentra's own AI agents about the product. The agents act as product, business and system analysts: they ask questions, find gaps and contradictions, and record what they learn as Drafts. People review the Drafts and approve or reject them. The approved knowledge is the single source of truth. Documents (Product Passport, Specs, ADRs, plans) are views of it, and external coding agents read it over MCP.

Success: a team and its coding agents answer "what are we building, why, how should it work, and what has already been decided?" from Intentra instead of reconstructing it every time.

Sources: `docs/product-brief.md`, `docs/product-documentation-model.md`.

## Positioning

Intentra is the knowledge and intent layer between people and AI developers. It does not keep a pile of documents. It keeps one canonical, linked model of Knowledge Items, each with a status, a source, an author and its relations. Documents and agent context are generated from that model. The AI may propose knowledge but never approves it. Only a person approves.

## Operating Context

- Structure: Workspace (top level; never "Organization") → Project → Knowledge. Members hold a Workspace Role (Owner, Manager or none) and a Project Role (Viewer, Contributor or Maintainer).
- Knowledge Items have a Kind (Term, Requirement, Decision so far; more planned), a Knowledge Key such as `REQ-12`, a Source with a Rationale, and a lifecycle: Draft → Approved or Rejected. Contributors record and edit Drafts, Maintainers approve and reject them, and an Approved item is never edited. Writes use optimistic locking: an approval confirms exactly the text the Maintainer read.
- There are two equal ways in: the web UI, and external agents (Claude Code, Codex, Cursor) over MCP, authenticated by a Member's Personal Access Token.
- The main loop: a Conversation with an Intentra agent (the AI interview) → Drafts → human review → approved knowledge → documents and agent context.
- The UI shows the server's access-policy verdicts. It does not re-derive permissions (`docs/adr/0002-client-shows-the-policy-verdict.md`).
- Glossaries: `CONTEXT-MAP.md` and the subdomain `CONTEXT.md` files. UI copy uses these terms.

## Capabilities and Constraints

- Built: sign-up and sign-in, Workspaces, Members, Roles, Invitations, Projects, Project Roles, Personal Access Tokens, Knowledge Items (Draft / Approve / Reject), and the MCP endpoint. The web UI is at an early stage: auth pages and an empty home page.
- Planned: the AI interview (Conversations with agents), more Knowledge Kinds, Supersession and Retirement, the Product Passport and other document views, planning (Objective → Epic → Feature → Spec → Task).
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
2. **One model, many views.** Documents, passports and agent context are views of the same Knowledge Items. Show where each statement comes from and what it links to.
3. **Traceable over clever.** Status, author, source, Knowledge Key and version are always reachable. A reader can always tell whether something is current, approved, and why.
4. **Equal for every role.** A product person, an architect and a developer each finish their job without needing another role's vocabulary. Engineering depth is available but not in the way.
5. **Web and MCP are peers.** Anything a person can see or do in the UI has the same meaning for an agent over MCP. The UI never invents concepts the model lacks.
