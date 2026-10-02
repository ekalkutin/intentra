---
name: Intentra
description: Product knowledge workspace for mixed product teams; the category-standard app frame, played straight.
colors:
  canvas: "oklch(0.992 0 0)"
  surface: "oklch(1 0 0)"
  ink: "oklch(0.21 0.006 286)"
  ink-inverse: "oklch(0.985 0 0)"
  frame: "oklch(0.965 0.0015 286)"
  frame-text: "oklch(0.37 0.01 286)"
  frame-active: "oklch(0.925 0.004 286)"
  muted: "oklch(0.967 0.001 286)"
  muted-text: "oklch(0.51 0.014 286)"
  hairline: "oklch(0.92 0.004 286)"
  input-stroke: "oklch(0.9 0.005 286)"
  accent-indigo: "oklch(0.6 0.13 278)"
  success: "oklch(0.56 0.14 155)"
  warning: "oklch(0.66 0.15 65)"
  destructive: "oklch(0.577 0.215 27)"
typography:
  headline:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.25rem"
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  body-strong:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  mono:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    fontFeature: "tnum"
rounded:
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "2rem"
  2xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-inverse}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-destructive:
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  input:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  list:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  list-row:
    typography: "{typography.body}"
    padding: "0.75rem 1rem"
  list-row-hover:
    backgroundColor: "{colors.muted}"
  status-badge:
    textColor: "{colors.muted-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "1.25rem"
    padding: "0.125rem 0.5rem"
  sidebar-item:
    textColor: "{colors.muted-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "2rem"
    padding: "0.5rem"
  sidebar-item-active:
    backgroundColor: "{colors.frame-active}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
  canvas:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
  canvas-header:
    height: "3rem"
    padding: "0 0.75rem"
  initial-tile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted-text}"
    rounded: "{rounded.md}"
    size: "2rem"
---

# Design System: Intentra

## Overview

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

## Typography

**Body Font:** Geist Variable (with sans-serif)
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, monospace), tabular figures always on

**Character:** one neutral grotesque carries every word at small sizes; the mono is a tool for values a machine produced, never a style. Three sizes (1.5rem, 0.875rem, 0.75rem) and three weights (400, 500, 600) cover all own code; the page title is the only tracked text, and the brand wordmark (600) is untracked.

### Hierarchy
- **Headline** (600, 1.5rem, 2rem, -0.02em, balanced): the page title in the page header; one per page, and the only text with tracking.
- **Title** (600, 0.875rem, 1.25rem): section titles. Sections are distinguished by weight and spacing, not size.
- **Body** (400 / 500, 0.875rem, 1.25rem): row text, descriptions, buttons (500), primary row text (500).
- **Label** (400, 0.75rem, 1rem): meta, the third line of a row, sidebar group labels, badges, initial-tile letters (600). Sentence case.
- **Mono** (400, 0.75rem, tabular): Knowledge Keys, slugs, counts, dates, URLs, token secrets and keyboard hints.

### Named Rules
**The Mono Is for Values Rule.** Geist Mono sets only keys, slugs, counts, dates and URLs (and secrets in copy fields). Names, roles and prose stay in Geist.

**The No Kicker Rule.** No eyebrows, kickers or uppercase tracked labels above headings. A section is its title plus at most one muted description line.

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

## Elevation & Depth

Content is flat. Depth comes from the tonal step between the frame and the canvas and from 1px hairlines. Shadow appears in exactly two places: the canvas (soft, ambient, always paired with a 1px ring) and floating layers the primitives own (menus, popovers). Dialogs rely on a ring and a plain scrim.

### Shadow Vocabulary
- **Canvas** (`--canvas-shadow`; light `0 1px 3px oklch(0.2 0.006 286 / 0.08), 0 1px 2px oklch(0.2 0.006 286 / 0.06)`, tinted on the neutral hue, dark `0 1px 2px oklch(0 0 0 / 0.25), 0 1px 1px oklch(0 0 0 / 0.18)`): the inset work area, from 768px, together with a hairline ring.
- **Floating** (primitive `shadow-md` / `shadow-lg` plus a 10% foreground ring): dropdown menus and submenus.

### Named Rules
**The No Blur Rule.** Nothing is frosted. Overlays dim with a plain scrim (`oklch(0.15 0.005 286)` at 35%) and `backdrop-filter: none`.

**The Flat Content Rule.** Lists, sections and headers carry no shadow. If something needs separating, use a hairline.

## Shapes

One base radius (0.5rem) scaled by multiplier, four steps only: controls, list blocks, menus and cards at 0.5rem; initial tiles, skeletons, sidebar items and small controls at 0.4rem; the canvas at 0.7rem; the avatar and dots round. Dialog corners (0.7rem), chat bubbles (0.7rem) and badge pills are owned by their primitives; the composer takes 0.7rem to match the bubbles it faces. Every border is 1px. Rows inside a list are divided, never separately rounded; the list block clips them.

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
- **Knowledge list:** the standard page column, like every list page (no narrower column of its own). The header carries no action: recording by hand starts from the Passport page, an outline "Записать" menu beside the primary "Интервью". One line above the list, on a hairline: the status views as line tabs, labels without side padding so the first starts on the column's left edge, 1.25rem apart, 44px tall (36px below 640px), mono counts for the chosen Kind; at the line's end, the list options as two quiet small selects, frameless and muted until pointed at or open (then the accent fill), sized to their words: the Kind (at most 13rem, each Kind's toned icon and count in the current status) and the order ("По ключу" / "Сначала новые", kept in the address so the item page steps through the same order); both menus drop under their trigger, right-aligned. In the Drafts view the line ends, after a 1rem hairline divider, in the view's one action: a small outline "Утвердить все" with a mono count, its frame on the column's edge. It opens a 32rem dialog (a click outside or Esc closes it): 1.25rem padding, the title at 1rem 600 carrying the count ("Утвердить 29 черновиков"), one muted line under it, then a list scrolling between the header's hairline and the footer, grouped by Kind (the toned icon, the Kind's name at 500 muted and a mono count, sticky while its rows pass), each row the mono key, in a column as wide as the group's longest key, then the title 0.5rem after it on one line (no statement: the list itself is what gets approved), a Draft that comes only as a dependency marked by a muted link icon and "зависимость" on the right; Drafts that cannot go head the list under an amber triangle, each with its reason in a label-size line under the title. Below 640px the options sit above the tabs, their icons on the column's edge. Neither filter locks the other: a Kind empty in this status stays choosable (its label muted), and an empty pair says so with outline buttons to the statuses that hold it (with counts) and to every Kind. Kind headings stick to the top of the canvas while their items scroll by. A row (0.875rem by 1rem padding, 2rem between body and meta): the Knowledge Key in mono muted before the title on its line (no lead column), the statement in two lines at most 68ch, fact chips, then the Links grouped by meaning ("Зависит от BR-5, PER-1", "Заменяет" / "Заменена на"), keys as mono links with their preview above the row's cover link. On the right a 14rem column of facts, right-aligned, two lines. On top, who proposed it: the author as a 16px initials avatar and name, followed, when an agent wrote it for them, by a 12px muted mark and the agent's short name at 500, no chip: Heart + "Intentra" for our own agent, Bot + "MCP" for an outside one; pointing at it opens a tooltip saying what it means ("Записал агент Intentra в интервью от имени …", "Записал внешний агент (Claude Code, Codex, Cursor…) через MCP от имени …, по его токену доступа"). Below, one status badge that also carries the time, the same shape for every status and in every view: "◌ черновик · 3 дня назад", "✓ утверждено · 22 сент." (how long ago the item last changed: relative up to a week, then the short date, tabular figures; the Needs Review badge before it when marked). No separate event line or event icon: the badge already says what the item is. The whole history with exact moments and people is the badge's tooltip, one event per line. Hints in a row are styled tooltips (never the native `title`), their triggers raised above the row's cover link. Dates are never set in mono here: Russian month words spread in it. Below 640px the column moves under the body, left-aligned. User decision, 2026-10-01.
- **Passport:** the Project's root page, a reading view of Approved knowledge only, in eight chapters from `docs/product-documentation-model.md` (Обзор, Цели, Пользователи, Возможности и сценарии, Правила и словарь, Интеграции, Качества и ограничения, Решения и открытые вопросы; Requirements split by type between chapters 4 and 7). The header is the Project's name alone with the outline "Записать" menu and the primary "Интервью" on its line; under it one signal line of links to the Knowledge views ("◌ N черновиков ждут утверждения", "⚠ N записей требуют проверки"), never a list of Drafts. A 42rem reading column: chapters split by a hairline with 3rem above, the number in mono muted before the title (title size), one muted line on what the chapter covers; a chapter of several Kinds titles each group at body size, muted, with the Kind's toned icon and a mono count. An entry has no border: its title at 500 with the Knowledge Key as a quiet mono link at the right, its choices in a label-size line, the main field as Markdown, then each other filled field under a label-size muted name (unfilled ones left out). A group shows 10 entries, then "Ещё N — в Знаниях →". Every chapter (unless the whole Passport is empty) carries one quiet ghost small "Обсудить" (chat icon, muted until hovered; icon only below 640px, its aria-label naming the chapter) at the right end of its title line, never inside the text: the same place in every chapter, so it is easy to find and never competes with the reading. It opens a new Conversation that has already sent the agent a first message, in the interface's language: for an empty chapter to fill it in, for a written one to add to it, naming what it holds (up to 12 items as `KEY «title»`, then "и ещё N") and asking for what is missing or contradicts itself, one question at a time with options, new findings as Drafts. The message travels in the link's location state, never the address, so a reload or Back never sends it twice. An empty chapter itself is one muted line, "Пока не описано."; an entirely empty Passport is a dashed Empty block with the Interview. From 1280px a 14rem "Содержание" sticks beside the column (numbers, titles, counts or "–", a 1px rail whose ink segment marks the chapter being read, by colour only so no title rewraps; the last chapter at the end of the text, a clicked chapter until the reader scrolls); below 1280px the same list folds above the text behind "Содержание · N из 8 описано". A chapter's address is `#passport-<chapter>`, written without a router navigation. User decision, 2026-10-01.
- **Analysis:** the Project's "Анализ" page, after Знания in the navigation: Intentra's checks of the Approved knowledge. The page header holds the title and one description line and no action. With no check yet the page is one dashed Empty block, roomier than a list's empty row (5rem vertical padding) and kept to three things: the SearchCheck mark in a 48px muted circle inside a fainter 72px ring, the title at 1.125rem 600 ("Проект ещё не проверяли") with one muted line under it ("Intentra найдёт противоречия и неясности в утверждённых знаниях."), then the primary "Проверить проект"; a Viewer sees it without the action. Under the header, always, the nightly check as one setting row in a List (as in the platform settings): "Проверять каждую ночь" at 500, one muted line saying what it means in its state, the switch at the row's end, centred on those two lines (disabled, with "Переключает тот, кто утверждает в проекте." added, for whoever may not change it); while it is on but cannot go ahead, an amber triangle and the reason in a line under it. Once there are checks, a section "История проверок" with a mono count carries the same primary action at the end of its title line, centred on it, right above the list it adds to (disabled with a spinner and "Идёт проверка" while one runs). A row: the moment at 500 then "· who" muted ("по расписанию" for a nightly one, followed by "· изменились N записей"), the outcome under it (the Open Questions found as Knowledge Key links, nothing found, or why it failed, in plain words), the status badge on the right (◌ Идёт, ✓ Готово, ⊗ Не удалось). The Passport's signal line adds "Intentra нашла N вопросов при проверке" (SearchCheck) when the newest finished check found some. User decision, 2026-10-03.
- **Related Tiles:** on an item's page, linked items are bordered tiles (0.5rem radius, 0.75rem padding) in a two-column grid from 768px, grouped under the Link's meaning with an arrow for out or in; each shows key, Kind, status, title, three lines of statement and facts, and opens the item. Rejected and Obsolete tiles fade to 70%. This is the one sanctioned tile grid: it previews content, it does not structure the page.
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
