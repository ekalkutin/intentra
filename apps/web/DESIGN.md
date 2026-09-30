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

Sidebar, top to bottom with nothing pinned to the bottom: the Project switcher (initial tile, Project name, Workspace name under it, a small filled downward triangle), the group "Работа" (the selected Project's sections), the group "Пространство" (the Workspace's pages). Workspace switching is a submenu of the Project switcher. No breadcrumbs, no tabs, no rail.

The canvas header is 3rem tall with a hairline under it, a three-column grid: the sidebar toggle left (tooltip names Ctrl B / ⌘B), the search centred (20rem outline button with a Kbd hint, collapsing to an icon under 768px), the avatar menu right.

Content sits in a page column up to 72rem, padded 1rem (2rem from 768px), 2rem top and 4rem bottom, with 2rem between blocks and 0.75rem between a section's heading and its list. Descriptions (page header and sections) are held to 42rem; inline forms and single fields (the invite form, the MCP address) to 32rem; form dialogs to 28rem. The page header puts the title and one description line left and the page's actions right, wrapping below when narrow. Two-column layouts appear only from 1280px (the Project overview splits 2fr / 3fr).

Pages outside a Workspace (first steps, received invitations) use a plain frame: a 3rem header with the brand left and the avatar menu right, and the page below it, in a 42rem column.

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

One base radius (0.5rem) scaled by multiplier, four steps only: controls, list blocks, menus and cards at 0.5rem; initial tiles, skeletons, sidebar items and small controls at 0.4rem; the canvas at 0.7rem; the avatar and dots round. Dialog corners (0.7rem) and badge pills are owned by their primitives. Every border is 1px. Rows inside a list are divided, never separately rounded; the list block clips them.

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
- **Mobile:** the sidebar becomes a sheet and closes after navigation.

### Initial Tile
A square with the first letter of a name (hairline border, canvas fill, muted 600 capital) standing in for a picture of a Project or Workspace, at 1.25rem in menus and 2rem in the switcher, 0.4rem radius, 0.75rem letter (0.875rem in the large tile).

### Navigating Row
A list row that leads somewhere takes `interactive`: its link stretches over the row, the row washes with muted grey at 60% on hover and on focus-within, and keyboard focus draws an inset indigo ring (2px at 50%, the same strength as the primitives) on the whole row.

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
- **Do** keep the page settle (220ms, ease-out-expo, 0.25rem rise) as the only page-level motion, collapsed under reduced motion.

### Don't:
- **Don't** build card grids, metric tiles or boxed dashboard panels.
- **Don't** add eyebrows, kickers or uppercase tracked labels above headings.
- **Don't** blur anything; dim with the plain scrim.
- **Don't** add decorative icons; an icon either names a navigation target, an action or a status.
- **Don't** signal status by colour alone, or use indigo, green or amber as a fill.
- **Don't** colour links, buttons, headings or statuses with indigo; links stay ink with an underline.
- **Don't** set names, roles or prose in mono.
- **Don't** add hover states to rows or blocks that do not navigate.
- **Don't** hard-code copy in components.
