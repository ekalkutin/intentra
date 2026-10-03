---
version: 1
slug: "src-pages-landing"
primary_target: "src/pages/landing"
related_targets: []
---

# Landing

Mode: Persuade. Public route /. Redesign (2026-10-03): the user asked for a new visual world after naming effect.website and openship.io as references, judged the particle hero weak and the page AI-generic. Confirmed answers: replace the whole look; the first viewport leads with the live product in frame; keep the four-question interview demo and the MCP terminal; GSAP motion is welcome. Primary action opens registration (existing sessions enter the workspace). Code-led build, no image generation in this environment. App design stays intact. Only documented capabilities; no customers, metrics or pricing; Orbit demo data is synthetic and labeled.

## Direction contract

THESIS: The page is one engineering drawing sheet of the product: a visible construction grid holds everything and the working interview is inscribed into its cells. It refuses the split hero with decorative art and the stack of marketing cards.

OWN-WORLD: Graphite sheet (#0c0d0f) inside a ruled frame, six construction columns with a dashed centre axis, registration crosses where section rules meet the frame, square panels flush to the lines, no glow; the one shadow is under the flying Draft card. Geologica display (second headline line light and slanted), Geist body, Geist Mono only for keys and commands. The existing pixel wordmark closes the page at full width. One indigo for Intentra actions; Kind tones and status colours stay inside product examples. The footer carries a compact responsibility block: Предлагает / Проверяет / Утверждает.

STORY: A visitor reads the claim, watches the analyst ask and record Drafts in the frame, approves one, sees a changed rule mark its dependents, sees a coding agent pull that context over MCP, then signs up.

FIRST VIEWPORT: Sticky 64px header on the frame (logotype, nav, language switch, sign in). Centred two-line headline at display scale whose second line rotates through what the intent becomes; one supporting paragraph; solid indigo primary action with a quiet secondary link. Directly beneath, across the full sheet, the product in one loop on three planes: what the team says (left), a Draft card on the review desk on the centre axis that a cursor approves, and three coding agents (right) that receive it as a `get_context` line. It fits 1440x900 whole.

FORM: Engineering drawing sheet, candidate 1 of the ordered list, chosen by the user as the pick card over the assigned transit schematic. Seed 6dbb299c. Signature interaction: the hero loop, where a quote becomes a Draft card that flies to the desk, is approved by a click, and flies on to an agent along a drawn beam, the scene leaning toward the pointer in depth. Motion grammar: GSAP; one load timeline (headline letters out of blur, rotating second line), the hero loop, scroll-drawn rules, a wired reveal of the knowledge map, a weight scrub on the closing claim, an approval check drawn in the footer; expo ease-out; still under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Kept behaviour

Interview demo: finite four questions, manual advance, pause/resume, restart, per-draft approval, shared RecordWave/transferCard flight; now also starts on its own once a third of it is in view. MCP showcase: four rotating scenarios, 5s hold, typed lines with reserved geometry, focus hold. Linked-knowledge scene (BR-12 → BR-13, two dependents marked for review) keeps its logic. Removed: particle canvas, floating question badges, hero caption, three-step list, Onest.

## Revision 2026-10-03 — hero loop, language, less drafting

User feedback on the first build: the headline was static and the hero's background motion was off-topic ("coordinates; we are not draftsmen"); asked for a hero built on cards flying to approval and knowledge leaving to MCP, at award-site polish; remove the pause control beside sign-in and add a language switch; in the linked-knowledge scene remove the reset button and the explanatory line. Done: the pointer crosshair and coordinate readout are gone, as are the Лист/Листов cells and the ГОСТ abbreviations. The interview demo moved back under its own heading below the hero and starts when a third of it is in view. The landing has a full English locale (`landing-en.ts`); the header uses the shared LanguageSwitch. The knowledge scene's approve action sits inside the rule sheet and is one-shot. No global pause control: loops stop offscreen and under reduced motion.

## Revision 2026-10-03 (second) — calmer hero, answered interview

User feedback: on large screens a quote overlapped the desk card; the loop was too fast; quotes should arrive from somewhere, possibly off-canvas; in the demo's Drafts the title and status must not underline on hover; the interview must be answered by the visitor instead of being started by a button. Done: quotes and agents keep a 44px gap to the desk and no negative margins; one beat is 3.7s with power2/power3 eases and smaller lean; each quote slides in from beyond the sheet's left edge with its wire and leaves upward before its next turn; cards stay opaque while two are in flight, the leaving one on top. The interview is now answered by the visitor: every question offers two answers as outline buttons, the pick becomes the user's bubble and the Draft's text, the Draft flies to the panel, and the next question follows; no play, pause or auto-start. Draft triggers no longer underline.

## Revision 2026-10-03 (third) — quiet full-bleed hero, decisions that propagate

User: the hero loop goes; the hero is only the title, the subtitle and one “How it works” action, nearly a full screen and full width if that does not break the concept; the linked-knowledge section must react to Approve / Decline, with new Drafts coming in and more examples; only an approved decision is sent on to Codex, Claude and Cursor, as the hero used to show. Done: header and hero break out of the frame to the viewport as a cover with the sheet's column lines running on behind the claim; the framed sheet starts under the hero's rule, so the concept holds. The hero loop component is removed. The linked-knowledge scene is an inbox of four incoming Drafts (replacement rule, replacement scenario, an answer to the open question, a new requirement), each approved or declined by the visitor, each decision changing the rule sheet and the linked records, and each approval delivered to the three agents in a strip under the scene. The first viewport no longer demonstrates the product; the interview directly below does.

## Revision 2026-10-03 (fourth) — hero actions, rotation fix, an invitation into the interview

User: put “Начать с идеи” back as the hero's primary action with “Как это работает” second; the rotating headline sometimes ended broken with phrases layered; the interview section did not draw the eye or say where to start, so show a component that invites and render the interview on click; drop the “Интерактивный пример” and “Orbit / Правила отмены” bar and the “AI предлагает…” footnote. Done: both hero actions; the rotation no longer runs as one repeating timeline but as discrete swaps that set every phrase's start and end state; the interview opens from an invitation (analyst's question, a composer typing the opening message, an indigo border beam, one send chip), and the panel has no title bar or footnote. The fictional-data note lives in the invitation's last line and in the page footer.

## Revision 2026-10-03 (fifth) — the interview plays like the real chat

User: the section lead should end on “see what comes of it”; under the invitation say that building a product has never been this simple (the user's own line, replacing the fictional-data note there); once opened, the chat must emulate messages one after another, with the agent visibly thinking as in the real chat; answers and Drafts should vary, Intentra must be seen finding flaws, and the example should not always be the booking service; the empty Drafts placeholder should be laconic without the duplicated icon; the Draft row's status label must not be pushed by a chevron, a hover effect is enough. Done as described in DESIGN.md's interview entry: three fictional products (Orbit, Kettle, Ledger), three questions each, answer order shuffled, twelve of the eighteen answers carry a finding that becomes an Open Question Draft, and the third question always has one, so every run shows Intentra catching something. The fictional-data note now lives only in the page footer.

## Revision 2026-10-03 (sixth) — the knowledge scene continues the interview

User: more incoming Drafts in “Решения связаны”, logically tied to what the interview last showed. Done: the page holds one product for both sections; the scene shows that product's rule, the records the interview produced (BR-12, SC-8, REQ-24, OQ-5) and six incoming Drafts written for it (replacement rule, replacement scenario, answer to the open question, new requirement, a question raised by Intentra's project check, a constraint). Switching the interview's example resets the scene to the new product. The end-of-interview actions are “Что дальше?” (scrolls here) and “Ещё пример”.

## Revision 2026-10-03 (seventh) — decisions rewrite the centre card

User rejected the approval's travelling path (chips flying from the click to the rule and on to records and agents) and asked instead that the centre card update with each decision, that the related records stop growing down the page, and that the “Один контекст. Для людей и агентов” strip go. Done: no flight; the centre card shows the record the current Draft is about and is rewritten in place by the decision, with a running history; records are a compact one-line list capped at eight rows with the centre's record marked; the reader strip is removed from the page.

## Revision 2026-10-03 (eighth) — the knowledge scene leads on; the scenario list is ruled

User: when all Drafts are decided, lead the visitor on as the interview does (a next button or another example), and polish the uneven scenario list in the agents section. Done: the finished inbox offers “Что дальше?” (to the agents section) and “Другой пример” (another product for the whole page); the scenario list is ruled rows with the prompt under each title and a playback hairline on the active one; the duplicated agent names are gone.

## Revision 2026-10-03 (ninth) — closing claim and footer

User: the closing claim becomes “Your agents can't read minds. Now they don't have to.” (Russian: «Ваши агенты не читают мысли. Теперь и не нужно.»); the “Интерактивный пример · вымышленные данные” line is removed at the user's request, so nothing on the page labels the examples as fictional any more; the responsibility block (Предлагает / Проверяет / Утверждает) leaves the footer, which now names the developer, Evgenii Kalkutin, with email, Telegram and LinkedIn links.
Follow-ups the same day: the agents section's link became the solid indigo invitation and its token note was removed; the footer credit reads “Built by Evgenii Kalkutin” in the headline's two voices, with email, Telegram and LinkedIn as outline chips.
