---
version: 1
slug: "src-pages-project-interview"
primary_target: "src/pages/project-interview"
related_targets: ["src/widgets/app-shell"]
---

# Interview: the chat with Intentra's agents

Mode: Operate. Scope: a Project's "Интервью" section: the Member's Conversations with Intentra (list, new, rename, hide, delete) and a Conversation streamed live. Audience: any Member of the Project; a Viewer gets answers but nothing recorded. The core loop of the product: talk → Intentra records Drafts → people approve. Real API only (`/api/workspaces/:w/projects/:p/conversations`, AI SDK UI message stream).

User decisions (2026-10-01, one question at a time): the Conversations are a column inside the canvas (route `…/interview/:conversationId`), a new one starts at `…/interview`; recorded Drafts show inline in the agent's message and in a right panel "Записано в разговоре" from xl; while the agent works a single live status line (shimmer), after the answer a collapsed "Ход работы" with reasoning, every tool call and Specialist; writes always visible. Stack: `@ai-sdk/react` useChat over the server's UI message stream, `streamdown` for streamed Markdown, shadcn chat primitives (MessageScroller, Message, Bubble, Marker, Questionnaire for `offer_choices`).

## Direction contract

THESIS: a conversation that visibly turns into knowledge: the transcript on the left of the eye, what it produced on the right, nothing decorative between. Refuses chat-app costume (avatars, gradients, sparkles, emoji, a "magic" accent).

OWN-WORLD: inherited DESIGN.md: neutral canvas, hairline column dividers, the person's turns in a muted bubble on the right, the agent's answer as plain document text at body size with no bubble, Knowledge Keys as mono links with previews, statuses as icon plus word, indigo only for focus, Geist Mono only for keys, counts and times.

STORY: a Member opens Интервью, picks or starts a Conversation, writes, watches one status line say what the agent is doing, reads the answer as it streams, answers a choice card with a click or a number key, sees each recorded Draft appear inline and in the panel, opens one to approve.

FIRST VIEWPORT: canvas split: a 16rem column (new conversation button, list by recent activity), the transcript centred at ~44rem with the composer pinned at the bottom (InputGroup with textarea, send/stop), an 18rem "Записано в разговоре" panel from xl (18rem, not 17: a Knowledge Item summary's key, Kind and status keep to one line there). Empty conversation: the Project's name as the one heading, a line under it, three starters.

FORM: canon (standing exit, app-shell brief, seed key a150ca9d); structure pinned by the user, no surface roll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
