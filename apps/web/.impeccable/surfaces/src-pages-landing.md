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
