---
version: 1
slug: "src-widgets-app-shell"
primary_target: "src/widgets/app-shell"
related_targets: ["src/pages","src/app/routes"]
---

# App shell: Workspace → Project

Mode: Operate. Scope: the signed-in shell, first run without a Workspace, received invitations, Workspace management (Projects, Members, Invitations, Personal Access Tokens, settings), Project overview, access and settings; Knowledge and Interview are stub pages. Audience: a mixed product team, no role first. Real API data only; access verdicts from `WorkspaceAccessDto` / `ProjectAccessDto`; routes by slug; the last Workspace, and the last Project per Workspace, remembered in localStorage.

Structure (user-pinned, 2026-09-30, final revision): an inset shell in the manner of ~/projects/multica: the sidebar sits on a quiet grey frame and the work area is a rounded, ringed canvas beside it. Sidebar, top to bottom, nothing split to the bottom: the Project switcher (initial tile, Project name, Workspace name under it, a small downward triangle; its menu lists Projects, "new project", and a Workspace submenu to switch or create Workspaces), then the group "Работа" (the selected Project's sections: overview, knowledge, interview, access, settings — always shown; on Workspace pages it points at the last opened Project), then the group "Пространство" (Projects, Members, Tokens for agents, Workspace settings). No breadcrumbs, no tabs, no rail on the sidebar's edge. The canvas header: the sidebar toggle button on the left (always), the search (⌘K on Apple, Ctrl K elsewhere) centred, the account menu (invitations, theme, sign out) on the right.

## Direction contract

THESIS: the category standard, played straight at Linear/Vercel craft: a conventional app frame where lists, statuses and keys carry the product, and nothing decorates. Refuses the earlier "record book" metaphor and any card-grid dashboard.

OWN-WORLD: neutral cool greys; a grey app frame (the sidebar's ground) around a near-white canvas with white lists; near-black primary buttons (inverted in dark); one muted indigo accent, oklch(0.6 0.13 278) light / oklch(0.72 0.11 278) dark (user decision, 2026-09-30), only for focus rings and unread dots; Geist for text, Geist Mono for Knowledge Keys, slugs, counts and dates; 0.5rem radius, 12px canvas radius; 1px borders; bordered lists with row dividers instead of cards; statuses as icon plus word (dashed circle Draft, check Approved, cross Rejected, slash Obsolete); shadows only on the canvas (soft), popovers and dialogs.

STORY: a Member opens the app, lands in their last Workspace and last Project, and works through "Работа"; switching Project (frequent) is the top of the sidebar, switching Workspace (rare) one level deeper in the same menu; the Workspace's pages are always the second group.

FIRST VIEWPORT: grey frame; the sidebar (Project switcher, "Работа", "Пространство"); beside it an 8px-inset canvas with a 12px radius, a hairline ring and a soft shadow. Canvas header 3rem: toggle left, search centred, avatar right. Content column up to 72rem: title and "Ваш доступ: …" on the left, the primary "Интервью" button on the right; below, at ≥1280px, two columns: "Знания по видам" (bordered list of Kinds, approved count with the Approved check, Drafts as a badge) and "Ждут утверждения" (bordered list of Drafts, key leading each row on the first line).

FORM: canon (standing exit), chosen in the re-roll round of seed key a150ca9d; quality bar Linear and Vercel.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- The mark stays a placeholder until a real logo exists.
