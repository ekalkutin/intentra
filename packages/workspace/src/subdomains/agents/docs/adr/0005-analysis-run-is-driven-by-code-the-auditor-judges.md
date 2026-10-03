# An Analysis Run is driven by code; the Auditor only judges one group at a time

The Auditor used to carry out an Analysis Run as one agent loop with tools: it listed the Project Kind by Kind, followed Links with `get_context` and recorded what it found, within 40 steps and 10 minutes. That held on dogfood Projects of 10–20 items but not beyond: the steps ran out on a few hundred items and the run looked done when only part was read; the lists show only the main field, so a number in acceptance criteria went unread; the history it resent on every step made cost grow faster than the Project; and the knowledge around an item came only from its Links, while contradictions live exactly between items nobody linked (BR-3 against REQ-2 in the dogfood). So the code now walks the Unchecked Knowledge Items (Approved and Drafts) and, for each, builds a group: the item with all its fields, its Similar Items and the items it is linked to, plus the Open Questions already recorded about them. The Auditor gets one model call per group and answers with its findings; the code records them as Draft Open Questions and marks the item checked. Every item is looked at, the cost is known before the run, groups run in parallel, and a run that stops halfway leaves the rest Unchecked for the next one.

## Considered Options

- **Keep the agent loop and add a `find_similar` tool.** Rejected: coverage would still depend on the steps lasting and on the model remembering to search.
- **Split the Project into parts (by Feature or by Kind) with one agent loop each.** Rejected: contradictions across parts, a rule against a requirement of another Feature, are the common case, and without Features there is nothing to split by.
- **A small agent with 3–5 steps per group.** Rejected for now: the group already holds every field it needs, so the extra steps would mostly cost without reading anything new.

## Consequences

- The Auditor has no tools: in the admin area it is instructions for a judge and a Model Profile. Agents ADR 0004 still holds: what it records is authored by Intentra.
- Duplicates are kept out by the model, not by a search before recording: each group carries the Open Questions about its items, Rejected ones included.
- Open Questions are never judged themselves: they only come along as what was already asked. An item is Unchecked unless a check holds its current version, and since a Knowledge Item's version grows with every change, no list of what changed is kept.
- A few items are judged at once; a run that stops on a model outage or an Auditor failure keeps what it recorded and the checks it made.
- Whether this checks better than the loop is measured on a benchmark Project with planted traps (Intentra's own documents, and a second project as a control), not assumed.
