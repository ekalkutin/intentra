---
name: Intentra
description: Product knowledge workspace for mixed product teams; the category-standard app frame, played straight.
colors:
  canvas: 'oklch(0.992 0 0)'
  surface: 'oklch(1 0 0)'
  ink: 'oklch(0.21 0.006 286)'
  ink-inverse: 'oklch(0.985 0 0)'
  frame: 'oklch(0.965 0.0015 286)'
  frame-text: 'oklch(0.37 0.01 286)'
  frame-active: 'oklch(0.925 0.004 286)'
  muted: 'oklch(0.967 0.001 286)'
  muted-text: 'oklch(0.51 0.014 286)'
  hairline: 'oklch(0.92 0.004 286)'
  input-stroke: 'oklch(0.9 0.005 286)'
  accent-indigo: 'oklch(0.6 0.13 278)'
  success: 'oklch(0.56 0.14 155)'
  warning: 'oklch(0.66 0.15 65)'
  destructive: 'oklch(0.577 0.215 27)'
  landing-canvas: '#0c0d0f'
  landing-panel: '#111216'
  landing-inset: '#17181d'
  landing-raised: '#202127'
  landing-ink: '#e9eaee'
  landing-subtle: '#9a9ca8'
  landing-accent: '#dedee3'
  landing-bright: '#f6f6f8'
  landing-display-quiet: '#a9abb8'
  landing-line: '#2a2b32'
  landing-frame: '#3d3e49'
  landing-grid: 'rgb(233 234 238 / 0.08)'
  landing-brand: 'oklch(0.72 0.11 278)'
  landing-brand-hover: 'oklch(0.8 0.1 278)'
  landing-approved: 'oklch(0.75 0.14 155)'
typography:
  headline:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: '2rem'
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: '1.25rem'
  body:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: '1.25rem'
  body-strong:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: '1.25rem'
  label:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: '1rem'
  mono:
    fontFamily: 'Geist Mono Variable, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: '1.25rem'
    fontFeature: 'tnum'
  landing-display:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: 'clamp(40px, 5.4vw, 78px)'
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  landing-display-accent:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: 'clamp(40px, 5.4vw, 78px)'
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: '-0.035em'
    fontVariation: "'slnt' -10"
  landing-claim:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: 'clamp(40px, 5.2vw, 76px)'
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  landing-headline:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: 'clamp(32px, 3.8vw, 56px)'
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: '-0.03em'
  landing-figure:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: '104px'
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: '-0.04em'
    fontFeature: 'tnum'
  landing-record-title:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: '24px'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  landing-title:
    fontFamily: 'Geologica Variable, Geist Variable, sans-serif'
    fontSize: '19px'
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '-0.02em'
  landing-body:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.6
  landing-lead:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.6
  landing-mono:
    fontFamily: 'Geist Mono Variable, ui-monospace, monospace'
    fontSize: '13.5px'
    fontWeight: 400
    lineHeight: 1.9
    fontFeature: 'tnum'
rounded:
  md: '0.4rem'
  lg: '0.5rem'
  xl: '0.7rem'
  full: '9999px'
  landing-control: '0px'
  landing-panel: '0px'
spacing:
  xs: '0.25rem'
  sm: '0.5rem'
  md: '0.75rem'
  lg: '1rem'
  xl: '2rem'
  2xl: '4rem'
  landing-section: 'clamp(88px, 10vw, 144px)'
  landing-group: 'clamp(40px, 5vw, 64px)'
  landing-gutter: '40px'
  landing-gutter-tablet: '28px'
  landing-gutter-mobile: '16px'
  landing-sheet-margin: '56px'
  landing-header: '64px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.ink-inverse}'
    typography: '{typography.body-strong}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0 0.625rem'
  button-outline:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.ink}'
    typography: '{typography.body-strong}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0 0.625rem'
  button-outline-hover:
    backgroundColor: '{colors.muted}'
  button-destructive:
    textColor: '{colors.destructive}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0 0.625rem'
  input:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0 0.625rem'
  list:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
  list-row:
    typography: '{typography.body}'
    padding: '0.75rem 1rem'
  list-row-hover:
    backgroundColor: '{colors.muted}'
  status-badge:
    textColor: '{colors.muted-text}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    height: '1.25rem'
    padding: '0.125rem 0.5rem'
  sidebar-item:
    textColor: '{colors.muted-text}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    height: '2rem'
    padding: '0.5rem'
  sidebar-item-active:
    backgroundColor: '{colors.frame-active}'
    textColor: '{colors.ink}'
    typography: '{typography.body-strong}'
  canvas:
    backgroundColor: '{colors.canvas}'
    rounded: '{rounded.xl}'
  canvas-header:
    height: '3rem'
    padding: '0 0.75rem'
  initial-tile:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.muted-text}'
    rounded: '{rounded.md}'
    size: '2rem'
  landing-button-primary:
    backgroundColor: '{colors.landing-brand}'
    textColor: '{colors.landing-canvas}'
    rounded: '{rounded.landing-control}'
    height: '52px'
    padding: '0 24px'
  landing-button-primary-hover:
    backgroundColor: '{colors.landing-brand-hover}'
  landing-language-switch:
    textColor: '{colors.landing-subtle}'
    padding: '10px 7px'
  landing-language-switch-active:
    textColor: '{colors.landing-bright}'
  landing-draft-card:
    backgroundColor: '{colors.landing-raised}'
    textColor: '{colors.landing-bright}'
    typography: '{typography.landing-record-title}'
    rounded: '{rounded.landing-panel}'
    padding: '24px 26px'
  landing-rule-sheet:
    backgroundColor: '{colors.landing-panel}'
    rounded: '{rounded.landing-panel}'
    padding: '30px 34px'
  landing-demo:
    backgroundColor: '{colors.landing-panel}'
    rounded: '{rounded.landing-panel}'
  landing-terminal:
    backgroundColor: '{colors.landing-panel}'
    typography: '{typography.landing-mono}'
    rounded: '{rounded.landing-panel}'
    padding: '36px 32px'
---

# Design System: Intentra

## Overview

**Scope:** Unprefixed tokens and the incumbent guidance below describe the authenticated Operate application. Tokens named `landing-*` and subsections titled “Public landing” describe only `.landing` on `/`, implemented in `src/pages/landing` and the `Public landing` block of `src/app/styles/index.css`. They are an intentional marketing extension, not replacements for the app palette, type scale, density, dark theme or motion rules. `/app` enters the existing workspace.

**Creative North Star: "The Category Standard, Played Straight"**

Intentra looks like the tool a product team already expects to work in, finished at the level of Linear and Vercel. A quiet cool-grey frame carries the sidebar; beside it the work area is a near-white canvas, inset by 8px, softly rounded, with a hairline ring and a barely-there shadow. Everything the product knows is shown as lists, statuses and keys; nothing on the page exists to decorate. The brand's commitment is to be the category standard, so the system wins on craft, restraint and consistency, not on a metaphor.

Density is that of a working tool: 14px text, 32px controls, hairline-divided rows, generous air between sections and tight air inside them. Colour is almost entirely neutral. Near-black is the primary control colour (inverted in dark mode); one muted indigo is reserved for focus rings and unread dots; green, amber and red appear only inside status icons and destructive actions. The system rejects card-grid dashboards, metric tiles, eyebrows above headings, frosted glass and decorative iconography.

The interface is composed from shadcn primitives (base-nova style on Base UI). They are installed by the CLI into `shared/ui/primitives` and never hand-edited; everything specific to Intentra lives in own components (`shared/ui/components`, `widgets`) that compose them, and theme-wide overrides live in the global stylesheet. All visible copy comes from i18n (Russian now, English later), so every layout must hold longer strings.

**Key Characteristics:**

- An inset shell: grey frame with the sidebar, a rounded ringed canvas beside it, a 3rem canvas header.
- Near-black primary controls, one muted indigo accent used only for focus rings and unread dots.
- Bordered lists with row dividers instead of cards.
- Statuses always as icon plus word.
- Geist for words, Geist Mono (tabular) only for machine-shaped values.
- Flat content; shadow only on the canvas and on floating layers.

### Public landing — scoped overview

The public landing is one drawing sheet of the product. A graphite sheet sits inside a ruled frame; six construction columns and a dashed centre axis run its whole height, every section is closed by a rule that ends in registration crosses on the frame, and every panel is square and flush to those lines. The product is not illustrated beside the claim but inscribed into the sheet: a hero loop in which what the team says becomes a Draft, a person approves it and a coding agent receives it; the working interview; a rule with what depends on it; a terminal. The page refuses the split hero with decorative art and the stack of marketing cards.

Type carries the voice: Geologica for claims, with a light, slanted second headline line that keeps renaming what the intent becomes; Geist for everything read; Geist Mono for keys, commands and the terminal. One indigo is spent on Intentra's own actions; Kind tones and status colours appear only inside product examples. The pixel wordmark closes the page at full width above a compact responsibility block (Предлагает / Проверяет / Утверждает). The landing ships in Russian and English, and its examples are a fictional project, labelled as such.

**Key characteristics (landing):**

- A framed sheet with six construction columns, a dashed centre axis and registration crosses on section rules.
- Square controls and panels; separation by rules and graphite steps, not by cards.
- Geologica claims with a light slanted rotating second line; Geist body; Geist Mono for machine text.
- A solid indigo invitation; indigo otherwise only where Intentra acts or an agent reads.
- The product shown working: hero loop, interview, linked knowledge, terminal.
- Motion draws the sheet (GSAP); everything is present and still under reduced motion.

## Colors

A cool neutral ramp (hue 286, near-zero chroma) with one muted indigo accent and three signal hues that never appear without an icon or a word. Frontmatter values are the light theme; dark values live in the sidecar and in `.dark` of the global stylesheet.

### Primary

- **Near-Black Ink** (`ink`): text and the primary button fill. In dark mode it inverts to near-white text and a near-white primary button with dark label.

### Secondary

- **Muted Indigo** (`accent-indigo`; `--ring`, `--sidebar-ring`, `--brand` share one value): every focus ring, the text selection tint (22% of the ring), and the unread dot on the account avatar. User decision, 2026-09-30.

### Tertiary

- **Approval Green** (`success`): the check of an approved item and the "done" status icon.
- **Review Amber** (`warning`): the triangle of "needs review".
- **Destructive Red** (`destructive`): destructive buttons, field errors, load failures, the "declined" status icon.

### Kind Tones

- **Eleven muted hues** (`--kind-<kind>`, class `text-kind-<kind>`; light `oklch(0.58 0.09 h)`, dark `oklch(0.75 0.08 h)`; Open Question stays neutral grey): each Kind of knowledge has one, used only on its icon (`KindIcon`, `KindBadge`) in lists, the Kind select, previews and the overview. Hues sit away from the signal hues and the indigo. User decision, 2026-10-01.

### Neutral

- **Canvas White** (`canvas`): the work area and the page ground inside it.
- **Surface White** (`surface`): list blocks, popovers, dialogs; one step brighter than the canvas.
- **Frame Grey** (`frame`): the app frame and sidebar ground, around the canvas.
- **Frame Text** (`frame-text`) and **Frame Active** (`frame-active`): sidebar foreground and the selected sidebar item.
- **Muted Grey** (`muted`; `--muted`, `--secondary` and `--accent` share one value, light and dark): skeletons, secondary fills, outline-button hover, and the wash under a navigating row (at 60%).
- **Muted Text** (`muted-text`): secondary lines, meta, leads, group labels.
- **Hairline** (`hairline`) and **Input Stroke** (`input-stroke`): 1px borders, row dividers, field strokes. The input stroke is deliberately one step stronger than the hairline (light 0.90 vs 0.92; dark 14% vs 11% white) so fields read as fields.
- Links are ink with an underline (0.2em offset); they do not take a hue.
- The shadcn `--chart-1` to `--chart-5` tokens are unused defaults (pure grey) and are not part of the system.

### Named Rules

**The One Indigo Rule.** Indigo is focus rings and the unread dot, nothing else. It never colours a link, a button, a heading or a status, and never fills anything larger than the dot.

**The Signal Needs a Word Rule.** Green, amber and red appear only inside an icon that sits beside a word, or on a destructive action. Colour is never the only carrier of meaning.

**The Inverted Night Rule.** Dark mode is the same system inverted: the frame goes darker than the canvas, the primary button turns near-white, the indigo accent and the signal hues lighten to hold contrast, so focus rings and the unread dot stay visible on the dark canvas. Borders become white at 11% (input 14%, sidebar 8%).

### Public landing — palette

The `landing-*` colors mirror the `--lp-*` custom properties declared on `.landing` (`--lp-canvas`, `--lp-panel`, `--lp-inset`, `--lp-raised`, `--lp-ink`, `--lp-subtle`, `--lp-accent`, `--lp-bright`, `--lp-line`, `--lp-frame`, `--lp-grid`) and the scoped `--brand`. The surface always runs `color-scheme: dark`, whatever the authenticated app's theme.

- **Graphite steps** (`landing-canvas`, `landing-panel`, `landing-inset`, `landing-raised`): the sheet; panels inscribed in it (the demo, the rule sheet, the terminal half, agent cells); inset fills (the person's answer, the active scenario); and the one lifted object, the Draft card on the review desk. Each step is a small tonal move, never a contrast jump.
- **Sheet ink** (`landing-ink`, `landing-bright`, `landing-subtle`): body ink; bright ink for headings, the logotype and whatever is active; subtle ink for supporting copy, keys and inactive items. `landing-display-quiet` is the cooler grey of the slanted second headline line and nothing else.
- **Drawing lines** (`landing-line`, `landing-frame`, `landing-grid`): section rules, panel borders and the dashed centre axis; the stronger frame on the sheet's sides and around the responsibility block; the faint construction columns. Registration crosses are drawn in subtle ink.
- **Silver accent** (`landing-accent`): the small approve chip inside the hero's Draft card, and the scoped `--primary` that shadcn primitives pick up.
- **Product indigo** (`landing-brand`, hover `landing-brand-hover`): the solid invitation, the travelling beams, an agent cell's border as context arrives, `get_context` and tool-call lines, the current-language underline, focus outlines, the caret and the selection tint (32%).
- **Approval green** (`landing-approved`): the frame of an approved Draft card and its ring, the check on a delivered `get_context` line, the drawn check in the responsibility block. Always beside the word or the row that says what was approved.
- Native KindIcon, KindBadge, KnowledgeStatusBadge and NeedsReviewBadge keep their product tones and meanings inside examples; terminal warnings take an amber prefix mark only.

**The Landing Boundary Rule.** The graphite palette, Geologica and the sheet's lines belong inside `.landing`; the authenticated app keeps its own tokens and theme behaviour.

**The Indigo Is Intentra Rule.** On the landing indigo marks Intentra acting or an agent reading: the invitation, a beam, a tool call, the current language, focus. It is solid only on the invitation and never colours a heading or a body link.

## Typography

**Body Font:** Geist Variable (with sans-serif)
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, monospace), tabular figures always on

**Character:** one neutral grotesque carries every word at small sizes; the mono is a tool for values a machine produced, never a style. Three sizes (1.5rem, 0.875rem, 0.75rem) and three weights (400, 500, 600) cover all own code; the page title is the only tracked text, and the brand wordmark (600) is untracked.

### Hierarchy

- **Headline** (600, 1.5rem, 2rem, -0.02em, balanced): the page title in the page header; one per page, and the only text with tracking. Actions beside a title with a description under it sit centred on the title's 2rem line and 2px lower, on its lowercase letters rather than its line box, so they do not read as riding high.
- **Title** (600, 0.875rem, 1.25rem): section titles. Sections are distinguished by weight and spacing, not size.
- **Body** (400 / 500, 0.875rem, 1.25rem): row text, descriptions, buttons (500), primary row text (500).
- **Label** (400, 0.75rem, 1rem): meta, the third line of a row, sidebar group labels, badges, initial-tile letters (600). Sentence case.
- **Mono** (400, 0.75rem, tabular): Knowledge Keys, slugs, counts, dates, URLs, token secrets and keyboard hints.

### Named Rules

**The Mono Is for Values Rule.** Geist Mono sets only keys, slugs, counts, dates and URLs (and secrets in copy fields). Names, roles and prose stay in Geist.

**The No Kicker Rule.** No eyebrows, kickers or uppercase tracked labels above headings. A section is its title plus at most one muted description line.

### Public landing — typography

**Display Font:** Geologica Variable (from `@fontsource-variable/geologica`, the `slnt` axis file; falls back to Geist Variable)
**Body Font:** Geist Variable
**Mono Font:** Geist Mono Variable, tabular figures on

Geologica sets every `h1`, `h2` and `h3` default, the logotype (21px, 600), the Draft card's title, the rule's figure, and names in the reader strip and the responsibility block. The hero is two lines at `landing-display`: the first upright at 600, the second at `landing-display-accent` (weight 300, slant −10, in the quiet display grey), rotating through three phrases. The linked-knowledge heading and the closing claim use `landing-claim`; other section headings use `landing-headline`. Headings are balanced and break where the copy breaks (`pre-line`).

Geist carries everything read: the lead under the headline (`landing-lead`), section paragraphs (`landing-body`), the analyst's question (19px, 17px mobile), FAQ questions (17px, 500) and answers (15px), navigation (14px), and the titles of records inside examples (21px and 19px at 500), which stay in the product's own face. Supporting text runs 12–15px in subtle ink. Geist Mono sets Knowledge Keys (12–13px), the `get_context` line, counts, and the whole terminal (`landing-mono`; 12px at ≤1100px).

Responsive: the hero is `clamp(30px, 8.6vw, 52px)` at 1.08 leading at ≤760px; section headings `clamp(30px, 8vw, 44px)`; the knowledge heading `clamp(36px, 9.5vw, 52px)`; the closing claim `clamp(34px, 9vw, 48px)`; the rule's figure 80px at ≤1100px.

**The Slanted Second Line Rule.** The hero's second line is the only light, slanted display text on the page; emphasis elsewhere is weight or bright ink.

**The Machine Text Rule.** Geist Mono is for what a machine wrote or reads: keys, commands, counts, the terminal transcript. Claims, names and prose never take it. The two language codes are the only uppercase text, and no label sits above a heading.

## Layout

The shell is a full-height `SidebarProvider` on the frame grey. The sidebar (16rem) sits directly on the frame; the canvas is inset 0.5rem from the top, right and bottom (flush left against the sidebar, 0.5rem when collapsed), with an `xl` radius. Below 768px the sidebar becomes a sheet and the canvas fills the viewport without ring or shadow.

Sidebar, top to bottom with nothing pinned to the bottom: the Project switcher (initial tile, Project name, Workspace name under it, a small filled downward triangle), the group "Работа" (the selected Project's sections: Интервью first, the product's core, set apart by the agent's mark ✳ in the brand hue instead of an icon, still at rest but turning once every 12s or so and all the while it is pointed at, still under reduced motion; then Паспорт, Знания, Участники (who may do what in the Project; never "Доступ", which people read as something else) and Настройки, the last only for whoever may delete the Project, since that is all it holds; ⌘K lists the same), the group "Пространство" (the Workspace's pages: Проекты, Участники, and Настройки (the page itself is titled "Настройки пространства") only for whoever may manage the Provider Key or delete the Workspace, the server's verdicts; ⌘K lists the same). A Member's own tokens are personal, not the Workspace's: "Токены доступа" sits in the account menu (avatar), under Приглашения, while a Workspace is open. Workspace switching is a submenu of the Project switcher, which ends with "Новое пространство" (when allowed) and "Покинуть «…»" for any Member, the leave confirmation opening from there. No breadcrumbs, no tabs, no rail.

The canvas header is 3rem tall with a hairline under it, a three-column grid: the sidebar toggle left (tooltip names Ctrl B / ⌘B), the search centred (20rem outline button with a Kbd hint, collapsing to an icon under 768px), right, the header controls shared with the plain frame (`HeaderControls`): the language switch (current code in mono caps), the light/dark switch, then the avatar menu, 4px apart.

Content sits in a page column up to 72rem, padded 1rem (2rem from 768px), 2rem top and 4rem bottom, with 2rem between blocks and 0.75rem between a section's heading and its list. Descriptions (page header and sections) are held to 42rem; inline forms and single fields (the invite form, the MCP address) to 32rem; form dialogs to 28rem. The page header puts the title and one description line left and the page's actions right, wrapping below when narrow. Two-column layouts appear only from 1280px (the Project overview splits 2fr / 3fr).

The Platform Admin's pages live in the same shell: a third sidebar group "Платформа" under "Пространство", shown only to a Platform Admin, and a group in ⌘K. On those pages the switcher and the first two groups stay on the Workspace opened last; someone in no Workspace sees a "← К пространствам" item in place of the switcher and no "Работа" group.

An object worth a page of text (a Knowledge Item, an Agent, a Skill) is edited on an **editor page**: a quiet back link above the page header, then the texts in the main column and its properties in a 17rem column on the right from 1280px, separated by a hairline rule (stacked below the texts when narrower). Saving is explicit, from a save bar pinned to the bottom of the canvas. A small object with a handful of fields (a Model Profile) is edited in a form dialog opened from its row instead.

A conversation with the agents (the Project's Interview) is a **conversation canvas**: the page column gives way to three panes inside the canvas, divided by hairlines. The Conversations list sits in a 16rem column on the left (a new-conversation outline button on top, a hidden-ones toggle pinned under a hairline at the bottom); the middle pane has its own hairline header row (the Conversation's title at body size, 500) above the transcript, which is centred in a 48rem column with the composer pinned under it in the same column; from 1280px an 18rem panel on the right lists what the Conversation recorded (18rem, not 17: a Knowledge Item summary's key, Kind and status keep to one line). Below 768px the list moves into a left sheet behind an icon button in the header row. User decision, 2026-10-01.

Pages outside a Workspace (first steps, received invitations) use a plain frame: a borderless 3.5rem header with the animated pixel wordmark left (6rem wide, a link home; the same `Brand` as the sidebar's foot, which now and then breaks into bands and snaps back, never under reduced motion) and, right, the language switch (current code in mono caps), the light/dark switch and the avatar menu; the page below it in a 36rem column set at 12vh from the top.

The first-steps page greets the person by name and shows one doorway, never an empty box: their invitations, if any, and nothing else (they were asked in, so creating their own is not offered); else the create form, when they may, with one muted line naming the email an invitation would come to; else an Empty block (dashed hairline, mail icon) explaining that a Platform Admin creates Workspaces and naming the email to be invited, with an outline "Проверить". The two empty doorways ask for new invitations every 20 seconds while the tab is focused, so one appears on its own. An invitation row is the Workspace's initial in a 32px muted tile, its name at 500 and "Пришло 30 сент. · действует до 7 окт." in label size, then ghost "Отклонить" and primary "Принять", all centred on one line (under the name, aligned with it, when narrow).

A new access token is shown once in a 42rem dialog: the secret in a copy field, then, under a hairline, "Подключите агента" with one short line under it ("Вставьте промпт в Claude Code или Codex: агент подключится сам."), an outline "Скопировать промпт" on the same line as the title (it turns into "Промпт скопирован" with a check), and a read-only preview of the prompt in a muted mono block folded to four lines that fade out, with a full-width "Показать целиком" / "Свернуть" bar under it (a chevron that turns). The preview shows the secret shortened (`intr_ssW…85`); only the copy carries it whole. The prompt gives the MCP address and token, the `claude mcp add --transport http … --header "Authorization: Bearer …"` command for Claude Code and the `[mcp_servers.intentra]` `url` + `bearer_token_env_var` setup for Codex, then asks the agent to check the tools. The closing button is "Готово", never a gendered "Я сохранил".

Platform settings (a Platform Admin's "Настройки") are rows in a List, one per on/off setting: its name at 500, under it what it means in its current state (the sentence changes with the switch), the Switch at the row's end; the switch moves at once and a failed save says why in red under the row.

### Scales

These sets are closed. New work reuses a step; it does not add one.

- **Font sizes (own code):** 1.5rem (page title), 0.875rem (body, section titles, list text), 0.75rem (labels, meta, badges, Geist Mono values). Primitives keep their own sizes (for example the small button at 0.8rem); those are primitive-owned, not system steps.
- **Weights:** 400, 500, 600. No 700.
- **Radius:** md 0.4rem (tiles, skeletons, small controls), lg 0.5rem (controls, lists, cards, menus), xl 0.7rem (canvas), full (avatar, dots). Nothing smaller, no bare default radius.
- **List rows:** one density, 0.75rem by 1rem padding with no minimum height (a single-line row is 44px, taller with meta); the Kinds list uses the same rows; row actions sit 0.5rem apart.
- **Menus:** one minimum width, 15rem, for the Project switcher, its Workspace submenu and the account menu.
- **Measure:** descriptions 42rem; inline forms and fields 32rem; page column 72rem.
- **Spacing rhythm:** 0.25, 0.5, 0.75, 1, 2, 4rem.

### Public landing — layout and motion

**The sheet.** One column at most 1328px wide, `landing-sheet-margin` from each viewport edge, with a 1px frame line on each side. Behind the content, six equal construction columns run the full height; the line on the centre axis is dashed. Content sits `landing-gutter` inside the frame. Every section ends in a 1px rule with an 11px registration cross where it meets the frame on each side. At ≤1100px the margin is 24px and the gutter `landing-gutter-tablet`; at ≤760px the margin is 8px, the gutter `landing-gutter-mobile`, the header 60px, and the construction columns are not drawn.

**Order.** Sticky header (`landing-header` tall, on the canvas, a rule under it: logotype left, navigation centred, RU | EN and sign-in right; at ≤760px the navigation folds into an inline menu under the header) → hero → interview demo → reader strip → linked knowledge → agents and terminal → FAQ → closing claim → wordmark and responsibility block. Section intros put the heading left and one paragraph (40ch) right on a shared baseline, with `landing-section` above and `landing-group` below; they stack on mobile.

**Hero.** Centred claim, lead (56ch) and actions, then the loop across the full sheet in three columns (1fr / 1.25fr / 1fr, at least 400px tall): team quotes left, the review desk on the centre axis, coding agents right, with one small line under it naming the fictional project. It fits 1440×900 whole. At ≤760px the three stack and show one quote and one agent at a time.

**Sections on the grid.** The demo splits into two equal halves on the centre axis (transcript 540px tall, Drafts on the canvas beside a rule; stacked with a 620px transcript on mobile). The reader strip is one row of cells (2fr + four of 1fr, 128px). The linked-knowledge map uses the six columns directly: Passport index and open question in column 1, the rule sheet across columns 3–4, two dependents in columns 5–6, joined by 1px wires; on mobile the wires go and the order is rule sheet, dependents side by side, then index and question. Agents: story left of the axis, the terminal filling the whole right half behind a rule. FAQ: heading in the left third, ruled rows across the right two thirds. The closing claim is centred. The footer is the wordmark at full sheet width, then a meta column beside the responsibility block.

**Motion.** GSAP with ScrollTrigger, SplitText and DrawSVG; expo ease-out is the house curve. All of it is registered only when reduced motion is not requested.

- *Load, once:* the construction columns wipe in from the top (1.8s); the first headline line arrives letter by letter from below and out of a 10px blur (0.9s, 35ms apart); the second line rises (1.3s) while easing from upright 600 to its light slant; lead, actions and the loop follow.
- *Rotating line:* each phrase holds 2.6s, leaves upward into an 8px blur (0.6s) and the next rises (0.9s); it runs only while the hero is in view.
- *Hero loop:* three records, one entering every 2.5s, each turn 6.9s. The quote lights; a beam runs its wire to the desk; the Draft card flies in from the quote, turning in depth; a cursor arrives and clicks approve; the dashed frame turns to an approval frame with a ring (0.8s) and the status flips; a beam runs to the agent and the card flies on; the agent's cell lights in indigo and shows its `get_context` line, then rests. Wires are permanent; beams travel. The desk breathes 7px. Three planes sit at −40px, 90px and −10px of depth under a 1100px perspective, and with a fine pointer above 760px the scene leans up to 6° sideways and 4.5° vertically toward it (0.9s follow). The loop pauses offscreen.
- *On scroll:* section rules draw from the left on scrub and their crosses turn in (0.7s); the knowledge heading rises line by line behind a mask; the rule sheet wipes down, the wires wipe left to right, the index and dependents fade in; the terminal half wipes in from the right (1.2s); FAQ rows settle 12px, 60ms apart; the closing claim gains weight from 250 to 600 on scrub; the wordmark is uncovered from below on scrub; the approval check is drawn (0.8s).
- *Examples:* the interview starts itself once 35% of it is in view and keeps the shared RecordWave and transferCard flight for each Draft; approving the rule traces two indigo signals along the wires (650ms, the second 500ms later) with needs-review badges at 500ms and 1000ms; terminal lines type at 22ms a character (650–1800ms), tool calls take 620ms, other lines 380ms, 160ms between rows, a finished scenario holds 5s; the caret blinks at 1s. Examples stop offscreen and in hidden tabs.
- *Reduced motion:* nothing moves and no transition runs. The hero rests on its last record, approved and delivered; the knowledge scene settles straight to its result; the terminal shows the selected scenario complete. Anchor scrolling is smooth only when motion is allowed. There is no global pause control.

## Elevation & Depth

Content is flat. Depth comes from the tonal step between the frame and the canvas and from 1px hairlines. Shadow appears in exactly two places: the canvas (soft, ambient, always paired with a 1px ring) and floating layers the primitives own (menus, popovers). Dialogs rely on a ring and a plain scrim.

### Shadow Vocabulary

- **Canvas** (`--canvas-shadow`; light `0 1px 3px oklch(0.2 0.006 286 / 0.08), 0 1px 2px oklch(0.2 0.006 286 / 0.06)`, tinted on the neutral hue, dark `0 1px 2px oklch(0 0 0 / 0.25), 0 1px 1px oklch(0 0 0 / 0.18)`): the inset work area, from 768px, together with a hairline ring.
- **Floating** (primitive `shadow-md` / `shadow-lg` plus a 10% foreground ring): dropdown menus and submenus.

### Named Rules

**The No Blur Rule.** Nothing is frosted. Overlays dim with a plain scrim (`oklch(0.15 0.005 286)` at 35%) and `backdrop-filter: none`.

**The Flat Content Rule.** Lists, sections and headers carry no shadow. If something needs separating, use a hairline.

### Public landing — depth

The sheet is flat. Separation comes from 1px rules and the graphite steps; nothing is frosted, and panels carry no shadow. Depth is spent once, in the hero loop: three planes at different distances that lean toward the pointer, a desk that sits nearest with two receding ghost sheets under it, and the Draft card, which alone casts a shadow (`0 36px 60px -32px rgb(0 0 0 / 0.85)`, straight down, soft) because it is the one object that is picked up and moved. Blur appears only in passing, on headline letters as they arrive. Native IntentraButtons inside the examples keep the product's own faint indigo shadow; the solid invitation has none.

**The One Lifted Object Rule.** Only the Draft card in flight casts a landing shadow. A panel that needs separating gets a rule or a graphite step.

## Shapes

One base radius (0.5rem) scaled by multiplier, four steps only: controls, list blocks, menus and cards at 0.5rem; initial tiles, skeletons, sidebar items and small controls at 0.4rem; the canvas at 0.7rem; the avatar and dots round. Dialog corners (0.7rem), chat bubbles (0.7rem) and badge pills are owned by their primitives; the composer takes 0.7rem to match the bubbles it faces. Every border is 1px. Rows inside a list are divided, never separately rounded; the list block clips them.

### Public landing — shapes

Everything the landing draws is square (`landing-control`, `landing-panel`): buttons, the demo, answers, Draft records, the rule sheet, agent cells, the terminal, scenario selectors, FAQ rows. Panels are flush to the sheet's lines rather than floating inside padding. Lines are 1px; a dashed line means provisional (the centre axis, a Draft that is not yet approved, the empty Drafts area), a solid one means settled. Wires are thin curves in the hero and right-angled runs in the knowledge map. Registration crosses are 11px. Product-native badges (status, Kind, needs review) keep their own pill shape inside examples, and the pixel wordmark keeps its pixel geometry.

**The Square Sheet Rule.** The landing adds no radius of its own. Rounded corners appear only on product badges quoted inside an example.

## Components

### Buttons

Quiet, compact, shadcn defaults.

- **Shape:** gently rounded (0.5rem), 2rem tall; 1.75rem for small.
- **Primary:** near-black fill with near-white label (inverted in dark); at most one per page header.
- **Outline:** canvas fill, hairline border; secondary actions, retry, the search trigger.
- **Destructive:** red label on a 10% red wash; delete and revoke only, always behind a confirm dialog (by slug for Workspaces and Projects).
- **Hover / Focus:** primary fades to 80%; focus shifts the border to the indigo with a soft 3px indigo halo at 50%; pressing nudges 1px down.

### Chips (Status Badges)

- **Style:** outline pill (1.25rem tall), hairline border, muted word, a 12px icon before it.
- **State:** pending = dashed circle (muted); done = check circle (green); declined = x circle (red); inactive = slashed circle (muted); review = triangle (amber). Only the icon takes colour.

### Cards / Containers

There are no content cards. The container is the **List**: a 1px-bordered, 0.5rem-rounded white block with hairline dividers. A row holds an optional mono lead (5rem column), the content, quiet meta on the right and actions; below 640px the lead moves above the content and the meta below it. All lists, the Kinds summary included, use the same row density (see Scales). Empty lists say what is missing and offer the action inside the list.

### Inputs / Fields

- **Style:** shadcn Field + Input: 1px input stroke, transparent fill, 0.5rem radius, 2rem tall. Slugs and secrets in mono.
- **Focus:** the border shifts to the indigo and a soft 3px indigo halo at 50% surrounds the field.
- **Error / Disabled:** red border and ring at 20%, error text below the field; disabled at 50% opacity.

### Navigation

- **Sidebar items:** 2rem, 0.4rem radius, 16px icon plus word in muted text. Hover washes with frame-active at 70%; the active item takes frame-active fully, medium weight and ink text.
- **Project switcher:** large menu button with an initial tile (2rem), the Project name (600) over the Workspace name (label), and a small filled triangle pointing down.
- **Command menu:** ⌘K / Ctrl K opens a command dialog with the current Project's pages, Projects (with mono slugs), the Workspace's pages and other Workspaces.
- **Pending count:** a count of pending work (the platform's unpublished changes) sits on its sidebar item's right in Geist Mono, muted, and disappears at zero.
- **Back link:** a small ghost button in muted text with a left arrow, sitting tight above the page header of a nested page; its label is the parent's name (mono when it is a key).
- **Mobile:** the sidebar becomes a sheet and closes after navigation.

### Initial Tile

A square with the first letter of a name (hairline border, canvas fill, muted 600 capital) standing in for a picture of a Project or Workspace, at 1.25rem in menus and 2rem in the switcher, 0.4rem radius, 0.75rem letter (0.875rem in the large tile).

### The Interview Exception

The AI interview is the product's core, so the chat (and the Interview's own mark in the sidebar) is the one sanctioned place where the calm system may come alive (user decision, 2026-10-01); the Passport and every other page stay in the house style. The way in is quiet: the Passport's "Обсудить" is an ordinary ghost button (chat icon), and only the page change it starts is animated, a view transition, the only one in the app: the page leaves into an 8px blur in 180ms and the Conversation comes out of it in 380ms (ease-out-expo, a 0.985 scale), already streaming the agent's answer. Under reduced motion it stays still. The agent's turning mark (`AgentSpark`) is shared by everything that shows the agent at work.

Inside the chat, knowledge materialises, one step after another and never in two places at once. When the agent records or changes a Draft while the Member watches (never for lines loaded from history): first the brand shimmer runs over the record's letters, its Knowledge Key and title, left to right: the same shimmer the chat's live status uses, in the brand hue, 1s, one pass, a 48px highlight, after which the text is plain again; once it has passed, the card itself flies: a copy of the tile that is coming leaves the record's line at a quarter to half its size (about three times the line's height) and flies in an arc (48px above the straight line, 900ms, ease-in-out) to the panel, growing to full size on the way, so what lands is what arrives. As the Draft is written, "Записано в разговоре" opens a place for it at the top: the slot grows from nothing to the card's height (500ms, ease-out-expo), pushing the others down, and shows a skeleton inside the card's frame; the real card is already rendered under it, unseen, and is what the flight copies. The line marks its key as on its way while it first renders, before the panel draws, so the card never shows early. When the copy lands, the skeleton gives way to the real card in the same frame, which then goes, so there is no seam, and a brand ring swells and fades over it (600ms). When the card cannot fly (reduced motion, the panel hidden below 1280px, the line out of sight) the tile simply shows, and it never waits more than 3.5s. The flight and the ring move only transform and opacity (never filter, box-shadow or layout); the slot's opening is the one layout animation, kept to the small panel and finished before the flight starts; the shimmer is a short background sweep clipped to a line of text, cheap to paint, so it runs on the compositor and stays smooth while the answer streams in on the main thread; the flying copy and the ring are removed when they finish. All of it is tuned in one object (`MATERIALISE`). A line written out of sight, or with the panel hidden below 1280px, only lights the tile or does nothing; under reduced motion nothing moves.

### Knowledge Items

- **Kind Badge:** the Kind's toned icon plus its name in muted text; never a filled chip.
- **Fact Chips:** an item's short facts (choices, list sizes, one-line texts) as 1.25rem outline chips in muted text, under its statement in rows, tiles and previews.
- **Priority:** a Requirement's priority (must, should, could) reads as three rising bars, filled to its level (3, 2, 1), in the text's own colour with the empty bars at 25%, before its word ("Обязательно", "Желательно", "Если успеем"), never with the MoSCoW term in brackets; the same in fact chips, on the item's page and in the editor's choice. Priority takes no hue: the bars carry it.
- **Choice icons:** every choice except a priority (which has its bars) reads with a 12px icon before its word, in the text's own colour, wherever the choice shows (chips, the item's page, the editor). Term sort: Box entity, Hash value, UserRound role, Zap action or event, Shapes other. Requirement type: SquareFunction functional, Gauge non-functional. Decision area: Layers architecture, Package product, Briefcase business. Persona type: User person, Server system. Constraint imposed by: Scale law, Wallet budget, CalendarClock deadline, Handshake customer, Building2 company, Server infrastructure. Integration direction: ArrowUpRight outbound, ArrowDownLeft inbound, ArrowLeftRight both. One table (`choiceIconOf` in `entities/knowledge-item`) holds them, and a unit test fails when a new choice value has no icon.
- **Knowledge list:** the standard page column, like every list page (no narrower column of its own). The header carries no recording action (recording by hand starts from the Passport page, an outline "Записать" menu beside the primary "Интервью"); its one action is the Drafts view's "Утвердить все", below. One line above the list, the same in every view so nothing moves when the view changes, on a hairline: the views read every day as line tabs (Все, Утверждённые, Черновики, На проверке, Пробелы), labels without side padding so the first starts on the column's left edge, 1.125rem apart, 44px tall (36px below 640px), mono counts for the chosen Kind; then "Ещё ▾", looking like a tab, a menu of the archive (Отклонённые, Устаревшие, each with its count), which while an archive view is open carries that view's name and count and the tab's line, so the chosen view is always named on the line. At the line's end, 1rem on, the list options as two quiet small selects, frameless and muted until pointed at or open (then the accent fill), sized to their words: the Kind (at most 13rem, each Kind's toned icon and count in the current status) and the order ("По ключу" / "Сначала новые", kept in the address, so "← Знания" on an item's page leads back to the same view, Kind and order, scrolled where it was; there is no stepping item by item, since the list's order means nothing to a reader); both menus drop under their trigger, right-aligned. Where the column is narrower than that line (56rem), the selects stand above the tabs, on the right from 640px; the tabs never wrap: where they still do not fit they scroll sideways, the hidden side fading out over 2rem, and the chosen view is kept in sight. A view's own action belongs to the page, not to the tab line: in the Drafts view the page header carries, at its right and level with the title, a small outline "Утвердить все" with a mono count (under the title below 640px). It opens a 32rem dialog (a click outside or Esc closes it): 1.25rem padding, the title at 1rem 600 carrying the count ("Утвердить 29 черновиков"), one muted line under it, then a list scrolling between the header's hairline and the footer, grouped by Kind (the toned icon, the Kind's name at 500 muted and a mono count, sticky while its rows pass), each row the mono key, in a column as wide as the group's longest key, then the title 0.5rem after it on one line (no statement: the list itself is what gets approved), a Draft that comes only as a dependency marked by a muted link icon and "зависимость" on the right; Drafts that cannot go head the list under an amber triangle, each with its reason in a label-size line under the title. Neither filter locks the other: a Kind empty in this status stays choosable (its label muted), and an empty pair says so with outline buttons to the statuses that hold it (with counts) and to every Kind. Kind headings stick to the top of the canvas while their items scroll by. A row (0.875rem by 1rem padding, 2rem between body and meta): the Knowledge Key in mono muted before the title on its line (no lead column), the statement in two lines at most 68ch, fact chips, then what is open about the item in one quiet 12px muted line (only when something is): "◌ 2 пробела" (a dashed circle) and "? 3 открытых вопроса" (the Open Question's toned mark), each naming them in a hint (the Gaps' hints, the questions as key and title), the same line under the statement in a Kind's table, then the Links grouped by meaning ("Зависит от BR-5, PER-1", "Заменяет" / "Заменена на"), keys as mono links with their preview above the row's cover link. On the right a 14rem column of facts, right-aligned, two lines. On top, who proposed it: the author as a 16px initials avatar and name, followed, when an agent wrote it for them, by a 12px muted mark and the agent's short name at 500, no chip: MessagesSquare + "Intentra" for our own agent in an interview, Bot + "MCP" for an outside one; an item Intentra found checking the Project has no Member behind it, so it reads "Intentra Audit" at 500 alone, no avatar or mark; pointing at it opens a tooltip saying what it means ("Записал агент Intentra в интервью от имени …", "Нашла Intentra при проверке проекта.", "Записал внешний агент (Claude Code, Codex, Cursor…) через MCP от имени …, по его токену доступа"). Below, one status badge that also carries the time, the same shape for every status and in every view: "◌ черновик · 3 дня назад", "✓ утверждено · 22 сент." (how long ago the item last changed: relative up to a week, then the short date, tabular figures; the Needs Review badge before it when marked). No separate event line or event icon: the badge already says what the item is. The whole history with exact moments and people is the badge's tooltip, one event per line. Hints in a row are styled tooltips (never the native `title`), their triggers raised above the row's cover link. Dates are never set in mono here: Russian month words spread in it. Below 640px the column moves under the body, left-aligned. User decision, 2026-10-01.
- **Passport:** the Project's root page, a reading view of Approved knowledge only, in eight chapters from `docs/product-documentation-model.md` (Обзор, Цели, Пользователи, Возможности и сценарии, Правила и словарь, Интеграции, Качества и ограничения, Решения и открытые вопросы; Requirements split by type between chapters 4 and 7). The header is the Project's name with one description line under it (the Passport is what the team approved; Drafts arrive once approved), the outline "Записать" menu and "Интервью" on its line, the page's one action in Intentra's own button (`IntentraButton`, default size, like Analysis's "Проверить проект"); under it the signals as quiet outline pills (1.75rem, label size), each a link to its Knowledge view or Analysis ("◌ N черновиков ждут утверждения", "⚠ N записей требуют проверки", "Intentra нашла N вопросов при проверке"), never a list of Drafts. The chapters fill the page column beside the contents, 3rem apart, with no rule between them: the number in mono muted leading the title on the column's edge, the line under it stepped in to the title's edge; the title at 1rem 600 (the one step between the page title and body, tracked -0.01em), one muted line on what the chapter covers. The Product Overview opens the Passport as a bordered block (the List's border and fill, 1.5rem padding): its title at 500 with the key at the right, the statement as the lead at 1rem with a 1.75rem line, then its other fields as a definition list on hairlines, the name in a 10rem label-size muted column (above the value below 640px). Every other group is a List like Knowledge's; a chapter of several Kinds titles each group the way Knowledge does (the Kind's toned icon, the name at 600, a mono count). A row: the Knowledge Key in mono muted before the title (a link to the item), the statement in full as Markdown (68ch), the item's fact chips in a column on the right (at most 16rem, right-aligned; under the statement below 640px), then, when it has other filled fields, a quiet "Подробнее" with a chevron that unfolds them in place (height, 250ms ease-out-expo, still under reduced motion) as the same definition list, and turns into "Свернуть". Unfilled fields are left out. A group shows 10 rows, then a last row "Ещё N — в Знаниях →". An empty chapter is a List holding one muted line, "Пока не описано."; an entirely empty Passport is a dashed Empty block with the Interview. Every chapter (unless the whole Passport is empty) carries one quiet "Обсудить" at the right end of its title line, never inside the text: the agent's own button (`IntentraButton`) in its quiet form, at rest only the agent's mark in the brand hue before muted text with no border or fill, taking the brand's tint, ring and soft glow, the mark turning and one sheen passing as it is pointed at or focused (icon only below 640px, its aria-label naming the chapter). It opens a new Conversation that has already sent the agent a first message, in the interface's language: for an empty chapter to fill it in, for a written one to add to it, naming what it holds (up to 12 items as `KEY «title»`, then "и ещё N") and asking for what is missing or contradicts itself, one question at a time with options, new findings as Drafts. The message travels in the link's location state, never the address, so a reload or Back never sends it twice. From 1280px a 15rem "Содержание" sticks beside the column: its heading at label size 500 with "N из 8 описано" muted at the right, then the chapters by number and title only (no counts, so numbers stand on one side; written ones at 70% ink, an empty one muted with the pending dashed circle at its end) on a 1px rail where one ink segment marks the chapter being read and slides to the next (500ms ease-out-expo, still under reduced motion), the stretch of rail above it in a fainter ink as already read; colour only, so no title rewraps (the last chapter at the end of the text, a clicked chapter until the reader scrolls); below 1280px the same list folds above the text behind "Содержание · N из 8 описано". A chapter's address is `#passport-<chapter>`, written without a router navigation. User decision, 2026-10-01.
- **Analysis:** the Project's "Анализ" page, after Знания in the navigation: Intentra's checks of the Approved knowledge. The page header holds the title and one description line and no action. With no check yet the page is one dashed Empty block, roomier than a list's empty row (5rem vertical padding) and kept to three things: the SearchCheck mark in a 48px muted circle inside a fainter 72px ring, the title at 1.125rem 600 ("Проект ещё не проверяли") with one muted line under it ("Intentra найдёт противоречия и неясности в утверждённых знаниях."), then the primary "Проверить проект"; a Viewer sees it without the action. Under the header, always, the nightly check as one setting row in a List (as in the platform settings): "Проверять каждую ночь" at 500, one muted line saying what it means in its state, the switch at the row's end, centred on those two lines (disabled, with "Переключает тот, кто утверждает в проекте." added, for whoever may not change it); while it is on but cannot go ahead, an amber triangle and the reason in a line under it. Once there are checks, "Проверить проект" is the page's one action, in the page header at its right, level with the title (under it below 640px), never between the setting and the list: an IntentraButton (`shared/ui`), the language of "Обсудить с Intentra", since starting a check sets Intentra to work: an outline in the brand's ink at 36px, led by the AgentSpark that turns once every 7s at rest and turns while pointed at, focused or starting, one band of brand light crossing it as the hand comes near. The section "История проверок" with a mono count then carries no action. Nothing on the page jumps: while a check runs the action fades out where it stood (300ms: opacity, a 95% scale and a 2px blur, then hidden and inert) and back once it is done, so the header keeps its shape; a run that appears while the page is open opens up into the list, its height growing from nothing as it fades in (500ms, ease-out-expo), the rows below easing down; runs already there on load do not move. None of it under reduced motion. A row: the moment at 500 then "· who" muted ("по расписанию" for a nightly one, followed by "· изменились N записей"), the outcome under it (the Open Questions found as Knowledge Key links, nothing found, or why it failed, in plain words), the status centred on the row's two lines at the right (under them below 640px): ✓ Готово, ⊗ Не удалось as status badges. A running check shows Intentra at work in the brand's ink, the language of the Interview: the row tinted faintly with the brand, a band of brand light passing over it left to right every 3.2s (none under reduced motion), its outcome line nearer to ink, and a 24px pill "Идёт проверка" (brand border at 30%, the turning AgentSpark at 15px); the section's action is gone meanwhile (the row already says it). A finished run's outcome is one line that says how far the team got ("Найдено 3 вопроса · все ждут решения", "· 2 ждут решения", "· все разобраны"; "Найден 1 вопрос · ждёт решения" / "· разобран") and, under it, its findings as a list with no rules of its own, each row on a soft hover fill (rounded, the list set out by 0.5rem so the text keeps the row's column): the Open Question's toned mark (16px), the Knowledge Key in mono muted (3rem, previewed on hover), the question itself as the link to its item (one line, two below 640px). Waiting for a decision is the default and goes unsaid; a settled finding says so quietly on the right ("✓ принят" in success, "× отклонён" or "устарел" muted, its question and mark faded). Three show, then a ghost "Ещё N" with a chevron that turns opens the rest. A finding deleted since reads "Черновик удалили" in muted text. The Passport's signal line adds "Intentra нашла N вопросов при проверке" (SearchCheck) when the newest finished check found some. User decision, 2026-10-03.
- **Item page layout:** from 1280px the title with its card line is a band across the page, and under it, 2rem lower, two columns start on one line (the content, then 17rem past 3rem): on the left what is open about the item ("Чего не хватает" / "Вопрос ждёт ответа"), then its fields and Links; on the right one column with no rule of its own (the content's card and the 3rem between them part the two), the actions first, 2rem under them Источник and Версия, then the timeline. With nothing open, the right column starts level with the fields. Narrower, one column in reading order: title, actions, what is open, content, then Источник, Версия and the timeline (one grid; the right column's wrapper dissolves with `display: contents` and its parts take their `order`). User decision, 2026-10-03.
- **Item page header:** the title with its Kind, key and status badge under it; at the right every action is a 32px icon button named by a tooltip and an aria-label, so a long title keeps its width: every action shown, no overflow menu (there are only a few): what changes the item in outline ("Править" pencil, "Удалить черновик" trash; "Контекст для агента" bot, "Записать замену" replace, "Вывести из обращения" archive), the destructive ones turning destructive on hover; then, past a 20px hairline, the decision: "Отклонить" (x, destructive on hover) and, "Утвердить", the one accent, in the success ink (a check on a 10% success fill with a 40% success border, a touch deeper on hover; a spinner while it runs; while something stops the approval, such as the item's own Needs Review mark or an Obsolete item in its chain, it is not shown at all, since the notice above says what to fix and offers the fix, rather than shown disabled), carrying "+N" in a small success dot at its corner when it takes N Drafts it depends on along (the tooltip says "Утвердить вместе с N черновиками"); so a long title keeps its width. The line under the title is the item's card (its Kind, key and status badge, Needs Review beside it), so the Properties column never repeats them: it holds only what that line does not say, as plain body text with no icons, mono or badges (Источник: "вручную", "Intentra", "внешний агент", "Intentra Audit"; Версия: the bare number; Заменяет / Заменена на as key links when there are any). History dates are plain tabular figures, never mono. The side column carries no headings of its own ("Свойства", "История" are only their sections' accessible names): the label and value pairs, then 2rem lower the timeline, whose dots and rail say what it is; each event names the Member by name, by email only when they have none. Above the body, the item's notices ("Требует проверки", "Утвердить пока нельзя", "Заменена записью …", why it was rejected or retired, whether a question is answered) and "Чего не хватает" are all one Notice (`shared/ui`), so they share every measure: a bordered card block (0.5rem radius, 1rem by 0.875rem padding, 0.75rem apart), an optional 16px status mark before the title, the title at 500, then the muted text 6px under it with its lines 6px apart; at most one small action, which from 640px keeps a column of its own on the right, 2rem past the text and level with the title, so no line ever runs under it; below 640px it closes the block, under the text (aligned with it, past the mark). "Чего не хватает" has no mark of its own: the title carries a mono muted count when there is more than one gap, and each gap is a line led by its own dashed circle (16px, muted). The shadcn Alert is not used here: its action floats over the text. The same block shows on an Open Question in force with no answer: "Вопрос ждёт ответа", its first line led by the Open Question's mark saying the answer will close it (then any gaps), and the Conversation it opens asks Intentra to find the answer. Once an answer is proposed (a Draft that answers it), the block is "Предложен ответ" (a mono count when several): each answer is one line, its Kind's toned mark, the mono key and its title, ending in a muted arrow down that eases 2px lower on hover; the line is not a link away but brings the answer's tile under "Отвечают на этот вопрос" into view (centred, smooth) and lights its frame once in the brand's ink (a 4px brand halo at 22% and a brand border at 65% that fade out over 1.8s, starting once the scroll settles; a jump and no glow under reduced motion), its link taking the focus; the tile opens the answer, read whole, where it is approved or rejected. Under the lines: "Утвердите его — и вопрос закроется вместе с ним. Не согласны — отклоните или обсудите с Intentra." The action is "Обсудить с Intentra", opening a Conversation that asks Intentra to check the proposed answer against the Approved knowledge. Approving an answer approves the Draft question with it (the "+N" on "Утвердить"; on the answer's page the question's tile under "Отвечает на" says "утвердится вместе"). "Обсудить с Intentra" speaks Intentra's language, the Interview's and the running check's: a small button in the brand's ink (35% brand border, 7% brand fill, a soft brand shadow that deepens on hover) led by the AgentSpark, which at rest turns once every 7s as if breathing and turns on while pointed at or focused; as the hand comes near, one band of brand light crosses it (1.1s, ease-in-out), the one authored moment; nothing moves under reduced motion. User decision, 2026-10-03.
- **Related Tiles:** on an item's page, "Связи" (600, a mono muted count of all Links, no description line unless there are none) groups linked items under the Link's meaning in muted 13px 500 with a mono count when there are several, no arrow icons. Linked items are bordered tiles (0.5rem radius, 0.875rem by 0.75rem padding) in a two-column grid from 768px: the mono key and the Kind, the title at 500 in two lines at most, two lines of statement, no fact chips; the whole tile opens the item. Approved is the norm and goes unsaid: only another state shows, as one quiet 12px word at the line's right with no icon of its own, since the Kind's mark already leads the line: "черновик", "устарело" in muted ink, "на проверке" in amber at 90%; Rejected and Obsolete titles go muted. When what the item depends on goes deeper, or a Draft takes it along when approved, "Зависит от" is that whole chain as one bordered list instead of tiles: rows on a soft hover fill, each the Kind's toned mark, the mono key, the title on one line, deeper levels indented 1.5rem behind a hairline elbow; for a Draft a row says what it means for approving ("утвердится вместе", muted), and each row that stops it names why in red at 85% ink, the one colour in the list, ("устарело", "отклонено", "на проверке", "вам не утвердить"). What to do about it is never said down here, far from the actions: it is a notice at the top of the content, under "Требует проверки", next to the item's actions: "Утвердить пока нельзя" with a red circled mark, one line per blocking item saying what to do ("PER-3 устарела — свяжите запись с актуальной заменой или уберите связь."), and an outline "Править" when the fix is re-linking and the person may edit; shown only to whoever may approve. An item that is itself a cause of the page's Needs Review mark is left out of it: "Требует проверки" already names it with its one fix, since "Всё ещё верно" moves the Link onto the replacement (or away), and says so per cause ("Запись опирается на PER-3, которую заменили на PER-9. Если запись верна и с PER-9, подтвердите — связь переключится сама."), then "Если нет — исправьте запись." ("запишите ей замену" for an Approved item). Every line names the items by key, never by a pronoun that could point at either. This is the one sanctioned tile grid: it previews content, it does not structure the page. User decision, 2026-10-03.
- **Dependency Tree:** the `depends-on` cascade as indented rows inside one bordered block, joined by hairline elbows.
- **Markdown:** item texts render as Markdown at body size (14px, 1.5rem leading, measure 68ch): lists, emphasis, inline code on muted, code blocks and tables in hairline blocks. Knowledge Keys in text become mono links with a hover preview of the item. A model's answer that is still arriving renders through StreamingMarkdown, which uses the same block components, so a streamed answer and a stored text look alike; unfinished syntax is completed rather than shown raw.
- **History:** a hairline timeline with small dots; only the approval (green) and the rejection (red) dots take colour, and a reason sits under its event.

### Editor Page

- **Properties column:** each property is a Title with its control or chosen values under it; a choice is changed by a quiet ghost "+ choose" button on the title's right. Chosen values list one per line (mono for ids and names a machine reads, linked when they open somewhere); a long set folds into groups under a chevron, a word and a mono count.
- **Save bar:** sticky to the bottom of the canvas, hairline above it, canvas fill, actions right (cancel as a ghost button, primary save). Leaving with unsaved changes asks first in an alert dialog (stay, or leave as destructive); closing the tab asks the browser's way.

### Markdown Editor

A long Markdown text (instructions, a Skill's body) in a growing field at least 24rem tall with 1.5rem leading. A small outline toggle beside the label switches between writing and reading; the reading view renders through the Markdown component in a hairline block, held to 72ch. A mono length counter against the limit sits under it on the right and turns red past the limit.

### Multi-Picker

Chooses any number of options: a quiet ghost trigger opens a 20rem popover with a search field and a command list, grouped under headings; each option is a label (mono for machine values) with an optional short mark and one muted hint line, chosen ones carry a tick. A "Done" ghost button under a hairline closes it. The chosen values are shown outside the popover, never inside the trigger.

### Change Marks

An object that differs from its published version carries a StatusBadge with the word: New and Changed as pending (dashed circle, not live yet), Removed as inactive (slashed circle). Marks sit in the row meta and in the editor page's properties column; they never take a colour of their own.

### Navigating Row

A list row that leads somewhere takes `interactive`: its link stretches over the row, the row washes with muted grey at 60% on hover and on focus-within, and keyboard focus draws an inset indigo ring (2px at 50%, the same strength as the primitives) on the whole row.

### Conversation

A conversation that visibly turns into knowledge, in the app's own materials: no avatars, no gradients, no sparkle or "magic" accent.

- **Transcript:** the person's turns are a muted Bubble on the right; the agent's answer is plain document text at body size with no bubble, no avatar and no name. Turns sit 2rem apart; MessageScroller keeps to the bottom edge and follows the answer as it streams, with no anchor on the person's turn (an anchor lifts the whole history to bring the sent message to the top, which reads as the chat jumping away); a reopened Conversation opens at its end; scrolling up stops the follow and shows the jump-to-latest button. Sending always brings the end into view, and a finished answer is brought to the end too unless the Member scrolled back meanwhile (an answer may end with a tall block, such as choice cards, that outruns the follow). A row paints only inside its box (`content-visibility`), so rows reach 4px past the column on each side to keep focus rings whole.
- **Live status:** while the agent works, one line under its answer says what it is doing. Concrete steps name themselves with a 16px icon and a muted word with the shimmer utility (reading, writing, asking a Specialist by name). While it only thinks, the line is a turning glyph (✢ ✳ ✶ ✻ ✽, still under reduced motion) and a phrase in the system's tone with an ellipsis, a new one at random every 5 seconds: phrases are objects with a tone (`playful`, the default, or `serious`), written natively per language in `shared/i18n/thinking-phrases`, never translated word for word. No typing dots; the line goes once the answer's words show.
- **Agent message:** three parts, 1rem apart, whatever order the parts streamed in: what it did (the folded work log and the Drafts it wrote, 6px apart), what it says (Markdown, 12px between blocks), and the question it asks, always last and 0.5rem further off, since it waits for the Member. Streamdown's own `space-y-4` is zeroed so only the gap spaces blocks. Choice options are body weight under the 500-weight question.
- **Work log:** after the answer, its steps fold above it under a small muted chevron, "Ход работы" and a count. Open, it is a hairline-ruled list in label size: an icon, the step in words first, the tool name after it in mono (secondary), reasoning as clamped muted text, a failed step marked with a red word.
- **Write rows:** each Draft the agent recorded or changed is one inline line in the answer, always visible: the Kind's toned icon, a muted verb, the Knowledge Key as a mono link with its preview, the title truncated. A failed write is a red line with an alert icon and the reason in muted label text under it.
- **Choice cards:** a question with clear-cut answers, held to 36rem, without an outer frame: the question in body 500 with one muted line under it saying how it works. A single answer is a list of outline buttons, each a reply sent on click or by its number key (a Kbd on the right that turns into an arrow on hover); no radio, since nothing waits for confirmation; an optional own answer is an input with a send arrow inside. Several answers use the shadcn Questionnaire with checkboxes, an optional own-answer input and a primary "Ответить · N" that stays off until something is picked or typed. Once answered, a static summary: the question, then every option as a wrapping 6px-radius chip — the chosen ones filled secondary with a check, the rest bordered and muted — and the own words as one more filled chip with a pen icon. A send button inside an InputGroup is never `disabled` (the group would grey out the whole field); it is `aria-disabled` and faded.
- **Composer:** the shadcn InputGroup with a growing textarea (at least 3rem, at most 15rem, 1.5rem leading) and a block-end row: a muted hint of the keys on the left (from 640px), a small primary send button on the right that turns into a secondary stop button while the agent answers. It sits in the transcript's column and keeps the transcript's scrollbar gutter, so both share edges.
- **Conversations list:** compact rows (0.4rem radius, body text, the latest activity as a mono time on the right) that wash with muted grey at 60% on hover and take it fully when open; a row's actions (rename inline, hide, delete behind a confirm) open from a ghost icon button that replaces the time on hover.
- **Recorded panel:** the items a Conversation recorded or changed, newest first, as bordered navigating tiles (0.5rem radius, 0.75rem padding) with the Knowledge Item summary read live, so a status follows approvals made elsewhere; its title carries a mono count.
- **Empty conversation:** set low in the transcript above the composer: the Project's name as the one heading (Headline) with one muted line under it; then "Что уже известно", a borderless map of all eleven Kinds in up to three columns (the Kind's toned icon, its name, Approved in mono and Drafts after a muted plus; an empty Kind fades its icon and shows a muted dash), each row starting a Conversation that fills or adds to that Kind; then "С чего начать", up to three starters in one bordered list, most pressing first (needs review, Drafts waiting, open questions, empty Kinds in the model's order, or "what is missing"), each with its icon, its words and a muted action with an arrow on the right. The map's rows come in once, 35ms apart (fade and a 4px rise, none under reduced motion); that is the screen's one motion.

### Public landing — components

- **Invitation:** LandingAction composes the product's IntentraButton and a router Link, restyled as `landing-button-primary`: a solid indigo block with canvas-coloured 15px 600 text, the AgentSpark mark (19px) before the label, no border, no shadow; 48px tall with 18px padding at ≤760px. Hover and focus lighten the fill (`landing-button-primary-hover`). The hero and the closing claim use the same button; a signed-in visitor gets the workspace instead of registration. Beside it in the hero sits a plain 14px ink link to the demo that underlines on hover.
- **Focus:** every link and button takes a 2px indigo outline offset 3px.
- **Header and language control:** logotype in Geologica; navigation in 14px subtle ink that brightens on hover; sign-in as a plain link. The language control shows both codes side by side, RU | EN, in 13px 500 uppercase with a 1px divider between them; the current one is bright with a 1px indigo underline, and a click on the other switches. The mobile menu toggle is a 40px ghost icon button.
- **Section rule:** a 1px line across the sheet with an 11px cross on each frame line; it closes every section and opens the footer.
- **Hero loop:** quotes are small bordered cells (role in 12px subtle ink, the words in 14px) that brighten and take a raised fill while spoken. The Draft card (`landing-draft-card`) carries its key in mono and the native status badge on top, the title in Geologica, the native Kind badge and a small silver approve chip below; its frame is dashed as a Draft and solid green once approved. A pointer cursor performs the approval. Agent cells are panel-coloured bordered cells with a terminal icon and name, an idle line, and on delivery `get_context → KEY` in mono with a green check. The whole scene is one image to assistive technology, with a text label.
- **Interview demo:** a square panel across the sheet with a title bar, a transcript half and a Drafts half. The finite four-question Orbit interview composes shadcn Card, MessageScroller, Message, Bubble, Accordion and Empty with native Kind and status badges. The analyst's question is plain 19px text; the person's answer sits on an inset fill. A native IntentraButton plays, pauses, resumes and restarts; a ghost button steps manually. Each Draft arrives by the shared RecordWave and transferCard flight into a bordered record that opens for individual approval, its border turning green when approved. Local illustrative state only.
- **Reader strip:** one row of ruled cells naming who reads the sheet: the team in the web interface and three coding agents over MCP, names in `landing-title`.
- **Linked-knowledge scene:** the rule sheet (`landing-rule-sheet`) holds the key and status, Kind badge, the rule's name, a large figure (`landing-figure`) with its unit, source, version line and, inside the sheet, a native IntentraButton that approves the replacement once (BR-12 at 24 hours becomes BR-13 at 48) and then stays disabled with the new label. Two dependents at the right flip from approved to needs review as the signal reaches them. There is no reset and no explanatory caption.
- **MCP showcase:** left of the axis, the heading, one paragraph, three agent names, four scenario selectors (shadcn Tabs as plain 14px rows; the active one bright on an inset fill, no arrows or dividers) and a text link. The terminal (`landing-terminal`) fills the right half from rule to rule: a header row (`orbit / intentra`, `MCP`), vertically centred lines with one-character prefixes, indigo tool calls, an amber mark on warnings, a status line and transport label in the footer. Hidden full-text spans reserve each line's space while it types, so nothing shifts. Keyboard focus holds a finished scenario.
- **FAQ:** shadcn Accordion as ruled rows: a rule above the first and under each, 17px 500 questions with 22px of vertical padding, answers at 68ch in subtle ink.
- **Closing and footer:** a centred claim, one line and the invitation. Below the last rule the shared Brand wordmark spans the sheet and links to the top. The responsibility block is a small ruled table framed on its top and left: three rows (Предлагает — AI-аналитик, Проверяет — Команда, Утверждает — Человек) with a narrow last cell that holds a drawn green check on the approving row, and beside them the name and tagline. No raster asset ships with the landing, so no raster provenance is owed.

## Do's and Don'ts

### Do:

- **Do** compose shadcn primitives wherever one exists; add new ones with the CLI and never edit files in `shared/ui/primitives`. Theme-wide changes go in the global stylesheet; Intentra-specific shapes go in own components.
- **Do** show lists as bordered blocks with hairline dividers (the List component).
- **Do** show every status as an icon plus a word (StatusBadge).
- **Do** set Knowledge Keys, slugs, counts, dates and URLs in Geist Mono with tabular figures.
- **Do** reserve the muted indigo for focus rings and unread dots.
- **Do** give hover feedback only to rows that navigate, and give the same row a visible keyboard focus.
- **Do** take every visible string from i18n and let layouts wrap for longer English or Russian strings.
- **Do** reuse the closed scales (sizes, weights, radii, row density, menu width, measure) instead of adding a step.
- **Do** edit long texts on an editor page (texts left, 17rem properties column right, sticky save bar, ask before leaving unsaved) and small objects in a form dialog.
- **Do** keep the page settle (220ms, ease-out-expo, 0.25rem rise) as the only page-level motion, collapsed under reduced motion.
- **Do** show an agent at work as one live status line (icon plus a shimmering word), never a spinner, and fold its steps under the answer once it is in; writes stay visible.

### Don't:

- **Don't** build card grids, metric tiles or boxed dashboard panels (the Related Tiles of linked knowledge are the one exception).
- **Don't** add eyebrows, kickers or uppercase tracked labels above headings.
- **Don't** blur anything; dim with the plain scrim.
- **Don't** add decorative icons; an icon either names a navigation target, an action or a status.
- **Don't** signal status by colour alone, or use indigo, green or amber as a fill.
- **Don't** colour links, buttons, headings or statuses with indigo; links stay ink with an underline.
- **Don't** set names, roles or prose in mono.
- **Don't** add hover states to rows or blocks that do not navigate.
- **Don't** hard-code copy in components.

### Public landing — quieter composition

The sheet explains itself by showing the product at work, so explanatory furniture stays out: no decorative arrow suffixes on links or actions, no captions that narrate an example, no reset controls, no global pause, no coordinates, sheet numbers or drafting-standard abbreviations. Functional notation stays: disclosure chevrons, chat controls, terminal prefixes and the arrow inside a `get_context` line. Each example carries exactly one label saying it is a fictional project. The flow is hero loop → interview → reader strip → linked knowledge → agents → FAQ → closing; standalone problem, feature-stack, manifesto and audience sections stay removed. This composition applies only to the landing.

### Public landing — scoped guardrails

- Do keep every landing override inside `.landing`, and leave the Operate application's tokens, theme and density alone.
- Do align new landing content to the frame, the six columns or the centre axis, and close each section with a rule and its crosses.
- Do keep landing panels and controls square and flush to the lines; separate with rules and graphite steps.
- Do show the product working with its native badges, keys and actions, with a person's approval visible in every example.
- Do take all copy from i18n in both Russian and English, and let headings break where the copy breaks.
- Do make every motion optional: the page is complete and still under reduced motion, and loops stop offscreen.
- Don't carry the graphite palette, Geologica, display sizes or the sheet's motion into authenticated app screens.
- Don't add landing shadows, glows, frosted surfaces or rounded cards; the Draft card in flight is the only lifted object.
- Don't use indigo for headings, body links or decoration, or Kind and status colours outside a product example.
- Don't set claims, names or prose in mono, and don't put a label above a heading.
- Don't invent customer logos, testimonials, metrics, pricing or capabilities; label synthetic demonstrations.
- Don't promote one-off line greys or sub-12px terminal sizes into tokens.
