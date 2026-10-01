---
version: 1
slug: "src-pages-project-passport"
primary_target: "src/pages/project-passport"
related_targets: ["src/widgets/app-shell"]
---

# Passport: the Project's root page

Mode: Read. Scope: the Project's index route (was "Оглавление"; sidebar label becomes "Паспорт"). Audience: every Member, and people outside engineering (clients, stakeholders) who need to understand the product. Job: read what the product is, built only from Approved knowledge. The Knowledge page stays the registry (statuses, filters, review); the Passport never repeats it.

User decisions (2026-10-01, one question at a time): option A (Passport) over Inbox or removal; depth "Document": every Approved item shown in full (main field, then its other filled fields), a section collapses after ~10 items into "ещё N — в Знаниях"; structure "document with contents on the side" (surface roll, seed e0ff11a8). Sections, from docs/product-documentation-model.md: 1 Обзор (product-overview), 2 Цели (goal), 3 Пользователи (persona), 4 Возможности и сценарии (scenario + functional and untyped requirements), 5 Правила и словарь (business-rule + term), 6 Интеграции (integration), 7 Качества и ограничения (constraint + non-functional requirements), 8 Решения и открытые вопросы (decision + open-question). An empty section says "not described yet" and offers the Interview. Drafts and Needs Review appear only as one signal line linking to the Knowledge views.

## Direction contract

THESIS: the product described in prose, the one view non-engineers can read; refuses the dashboard of counts and the registry table the Knowledge page already is.

OWN-WORLD: inherited DESIGN.md: neutral canvas, a reading column, section titles numbered in Geist Mono, items as document entries (title 500, main text, fields as labelled sub-blocks), Knowledge Keys as quiet mono links at the right of each entry title, Kind tone only on Kind icons, no cards, no borders around entries, hairlines between sections only.

STORY: a reader opens the Project, reads the Overview first, scans the contents to see which chapters are written and which are empty, jumps to one, follows a key to its item; a Member sees at a glance that Drafts wait and goes to review them.

FIRST VIEWPORT: page header (Project name alone, the actions Record and Interview on its line; no description, user decision 2026-10-01), one signal line under it when Drafts or Needs Review exist, then chapter 1 Обзор: the summary as a lede at body size, problem, audience, value as labelled paragraphs. From 1280px a 14rem sticky "Содержание" on the right: 8 numbered chapters with item counts, empty ones muted, the chapter in view marked.

FORM: grounded candidate 1 of 7 (docs reader with side contents), seed key e0ff11a8.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
