# Keyboard shortcuts: open questions

Written on 2026-10-01. The app has a few shortcuts, each added where it was needed, with no shared set of keys and no single way of showing them. Before adding more, decide the set and how it is shown; until then the code below stays as it is.

## What exists

| Keys        | Where                                 | What it does                      | Where it is defined                                                           | How it is shown                                               |
| ----------- | ------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ⌘K / Ctrl K | everywhere in a Workspace             | opens the command menu            | `src/widgets/app-shell/ui/command-menu.tsx` (`OPEN_KEY`)                      | `Kbd` inside the search button in the canvas header           |
| ⌘B / Ctrl B | everywhere in a Workspace             | shows or hides the sidebar        | shadcn's `src/shared/ui/primitives/sidebar.tsx` (`SIDEBAR_KEYBOARD_SHORTCUT`) | `Kbd` in the tooltip of the sidebar toggle (`app-header.tsx`) |

Notes on what is there now:

- Each shortcut has its own `keydown` listener, with its own rule for when to stay quiet: textareas, selects, editable text, dialogs and menus; ⌘K listens on `document` and fires anywhere.
- Nothing lists the shortcuts in one place for the person (no help dialog, no mention in the command menu).

## To decide

1. **The set of keys.** Which actions get a key at all, and which keys: single letters in the manner of Linear and Gmail (J / K, E to edit, A to approve…), or only modifier chords (⌘ / Ctrl …), or both. Single letters are fast but collide with typing and with screen readers' quick navigation; chords are safe but fewer.
2. **One registry.** One place (likely `shared/lib` or `shared/config`) that names every shortcut once, with its keys per platform, its scope (global, a page) and its label; listeners and `Kbd` labels read from it, so a key and its label cannot drift apart.
3. **One way of showing them.** Where a key is shown (tooltips, menu items, buttons, the command menu), in which form (`⌘K`, `Ctrl K`, `J`), and whether there is a "keyboard shortcuts" dialog (commonly on `?`).
4. **When they stay quiet.** One rule for all: in fields, in dialogs and menus, while IME composition runs, with modifiers held.
