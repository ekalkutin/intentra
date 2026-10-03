# Feature Assignment changes an Approved item's Links without a Supersession

An Approved Knowledge Item is never edited, and its Links otherwise change only by moving onto a replacement. Putting an Approved Scenario, Requirement or Business Rule into a Feature (its `part of` Link) is the one exception: a Maintainer does it directly, as Feature Assignment, and the item keeps its Knowledge Key. Being part of a Feature sorts knowledge but makes it neither more nor less true, while a Project that already has dozens of Approved items would otherwise have to supersede every one of them to adopt Features. Decided on 2026-10-03.

## Considered Options

- **Supersession with the same text plus `part of`.** No exception to the model, but every Key changes (`REQ-12` becomes `REQ-31`), references to the old Keys go stale, and the review list fills with clones made for one Link.
- **Only new items get a Feature.** Features would be useless for existing Projects, and the Gap "a Scenario that is part of no Feature" would sit on every old Scenario.

## Consequences

- It is a Member's act with the same rights as approving: a Maintainer in the web UI, an external agent only on a token that allows approving; Intentra's own Agents only suggest it.
- It is kept in the item's history, since it changes the Passport and the Context Packs the team sees.
