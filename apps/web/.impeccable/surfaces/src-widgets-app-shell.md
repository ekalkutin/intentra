---
version: 1
slug: "src-widgets-app-shell"
primary_target: "src/widgets/app-shell"
related_targets: ["src/pages","src/app/routes"]
---

# App shell: Workspace → Project

Mode: Operate. Scope: the signed-in shell (spine sidebar, top bar, ⌘K), first run without a Workspace, received invitations, Workspace management (Projects, Members, Invitations, Personal Access Tokens, settings), Project overview, Project Roles and settings; Knowledge and Interview are honest stub pages. Audience: a mixed product team, no role first. Real API data only; access verdicts from `WorkspaceAccessDto` / `ProjectAccessDto`; routes by slug (`/w/:workspace/p/:project`); the last Workspace remembered in localStorage.

## Direction contract

THESIS: Intentra is a laboratory record book. Every piece of knowledge is an entry: graphite while it is a Draft, ink once a person signed it, struck through with one line (still legible) when rejected. Refuses the neutral card dashboard with metric tiles.

OWN-WORLD: cool near-white page; blue-black ink for text and primary controls; graphite for proposed/secondary; one record-book red used only for the margin rule and destructive actions. A dark cloth spine (sidebar) in both themes. Hairline ruled rows, not cards. Geist for prose, Geist Mono tabular for keys, counts, dates, versions and slugs, all aligned on the margin axis. Small radius. Every status has a mark (dashed, solid, struck), never color alone.

STORY: a Member opens the app, lands in their last Workspace, picks a Project volume on the spine and sees its table of contents: what is signed, what waits for a signature, what needs review. Workspace pages are the book's front matter: signatories (Members), invitations, agent tokens.

FIRST VIEWPORT: spine left (Workspace switcher on top, Project volumes, the open Project's sections, Workspace front matter, account at the foot). Main: thin top bar with breadcrumbs and ⌘K. Page: a red vertical margin rule ~7rem from the left edge running the full height; slug in the margin, Project name as the title right of it; below, the table of contents by Kind with dot leaders to counts; beside it at ≥1280px the "awaiting signature" ledger with keys in the margin. Primary action (Interview) top right of the page header.

FORM: "Laboratory record book", position 3 of 7 on the ordered list; seed key a150ca9d. Raises: marks not hues (cyclorama); tabular mono on one margin axis (dive); palette law (arcade); one geometry — the margin rule — drives layout, keys and state marks (zoo). Signature interaction: hovering or focusing an entry reveals its provenance (author, source, version) in the margin. Motion: the margin rule draws top to bottom once on first load; pages crossfade while the rule stays put.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- The mark stays a placeholder until a real logo exists.
- Knowledge list, Draft review and the Interview get their own surfaces later; they inherit this world.
