# Project Knowledge

A subdomain of the Workspace context (see `CONTEXT-MAP.md`). The structured, living model of what a Project is: its goals, users, requirements, rules, terms and decisions. Conversations, manual edits and imports feed it; documents and the context given to agents are views of it.

## Language

**Knowledge Item**:
One piece of what is known about a Project, such as a Term, a Business Rule or a Decision. Every Knowledge Item has a Kind, a status, an author and a source, and the fields of its Kind. It is deleted together with its Project, and stays, Drafts included, when its author leaves the Workspace or is removed. Every change to it is made on the version its author last saw; a change made on an older version is refused, so no one's work is silently overwritten.
_Avoid_: Artifact, Entry, Record, Fact

**Knowledge Key**:
The short, human-readable name of a Knowledge Item within its Project, made of its Kind's prefix and a number, such as `REQ-12` or `BR-4`. Each Kind is numbered on its own within the Project: `REQ-1`, `REQ-2`, `TERM-1`. It is given when the Knowledge Item is recorded, even as a Draft, and never changes or is reused, so gaps are normal. A Supersession gets a new Key: `REQ-12` superseded by `REQ-31`.
_Avoid_: ID, Number, Ticket, Code

**Kind**:
What sort of knowledge a Knowledge Item holds, such as Term, Requirement or Decision. The Kind decides which fields the Knowledge Item has; every Kind shares the same lifecycle. For now the Kinds are Product Overview, Goal, Persona, Feature, Scenario, Requirement, Constraint, Term, Business Rule, Integration, Decision and Open Question.
_Avoid_: Type, Category

**Term**:
A word of the Project's shared language and what it means. A Term is labelled by what sort of concept it names: an Entity (something with its own identity, such as an Invitation), a Value (such as a status), a Role, an Action or Event, or Other. How an Entity is built in code is not Project Knowledge; what states it goes through in the business is written in its definition and in Business Rules.
_Avoid_: Glossary entry, Concept, Entity (as a separate Kind)

**Scenario**:
What a Persona does in the product to reach an outcome, step by step, and what result they get. It describes how the product behaves and stays true for as long as the product works that way; slicing it into work is Planning's job.
_Avoid_: User story, Use case, Flow

**Feature**:
A named capability of the product as its users see it, such as "Invitations to a Workspace" or "the Product Passport", which the Scenarios, Requirements and Business Rules about it belong to. It **depends on** the Goal it serves. It is knowledge, not work: it stays true for as long as the product has that capability, and is retired when the capability is dropped. Whether it is built yet is not part of it; that belongs to Planning.
_Avoid_: Epic, Module, Component, User story

**Feature Assignment**:
A Maintainer putting an Approved Scenario, Requirement or Business Rule into a Feature, moving it to another one, or taking it out, without a Supersession: being part of a Feature sorts knowledge but does not make it more or less true, so the item keeps its Knowledge Key. It is a Member's act like approving: an external agent may do it on a Member's behalf only when that Member's access token allows approving, and Intentra's own Agents never do it, only suggest it. It is kept in the item's history. A Draft is put into a Feature simply by editing its Links.
_Avoid_: Tagging, Grouping, Reclassification

**Decision**:
A choice the Project has made, why, and which alternatives were turned down. A Decision has an area: architecture, product or business.
_Avoid_: ADR (that is one kind of document about a Decision), Choice

**Open Question**:
Something about the Project that is not settled yet. It names what it is about through **concerns** Links, and is answered once an Approved Knowledge Item answers it; it has no status of its own for that.
_Avoid_: TBD (as a word; `TBD` is only its Key prefix), Issue, Unknown

**Requirement**:
Something the Project wants from the system: a function it performs or a quality it has (functional or non-functional). It can be discussed, prioritised and relaxed.
_Avoid_: Feature, Spec, User story

**Constraint**:
Something imposed on the Project from outside that is not up for discussion: a law, a budget, a deadline, a customer's or company's mandate, existing infrastructure. Whether something is a Constraint depends on where it comes from, not on what it is about: "we chose AWS" is a Decision, "the company only allows AWS" is a Constraint.
_Avoid_: Limitation, Restriction, Non-functional requirement

**Link**:
A directed connection from one Knowledge Item to another, of one of these types: **depends on** (it holds only while the other holds), **uses term** (it uses a Term), **justified by** (a Decision is the reason for it), **part of** (a Scenario, Requirement or Business Rule belongs to a Feature; only these have it, at most one each, and it points only to a Feature), **answers** (it settles an Open Question), **concerns** (an Open Question is about it; only an Open Question has this Link, and it never sets Needs Review, since a question cannot become untrue) and **conflicts with** (the two contradict each other). A Link always points from what serves or rests to what it serves or rests on: a Feature, Scenario or Requirement **depends on** the Goal it serves, never a Goal on what serves it; what is **part of** a Feature serves the Feature's Goal through it and needs no Link of its own to the Goal. A Link is recorded and approved together with the Knowledge Item it starts from.
_Avoid_: Relation, Reference, Dependency

**Source**:
Where a Knowledge Item came from: a Conversation, in which an Agent recorded it; an Analysis Run; an external agent working for a Member over MCP; or a person entering it by hand. It says which of the four, never which Conversation. Unless it was entered by hand, a Source always carries a Rationale: a short quote or summary of what the Knowledge Item rests on, supplied by the Agent that recorded it. The Rationale is part of the knowledge and the team sees it, while the Conversation (or the external agent's own chat) stays private. The Source never changes; while the Knowledge Item is a Draft, its Rationale can be edited like the rest of it.
_Avoid_: Origin, Provenance, Reference

**Draft**:
A Knowledge Item that has been recorded but not yet approved. Agents, Intentra's own and external ones, only ever record Drafts. A Draft can be edited freely, by an Agent or any person who may record knowledge, not only its author. It keeps no history of its edits, only who edited it last and when; its author stays the one who recorded it: a Member, or Intentra itself for a Draft recorded in an Analysis Run. Searches show Drafts marked as such; context assembled for implementing a task holds only Approved knowledge.
_Avoid_: Proposal, Suggestion, Pending

**Approved**:
A Knowledge Item a Member has confirmed as true for the Project. Approving is always a Member's act: Intentra's own Agents never approve, and an external agent may approve on a Member's behalf only when that Member's access token allows it. Only a Maintainer of the Project may approve, reject, supersede or retire, including the author. A Knowledge Item created by hand is also first a Draft. A Knowledge Item can be approved only once everything it depends on, and the Feature it is part of, is Approved; a person may approve it together with those Drafts in one step. A Draft Open Question it answers is approved in the same step, since answering settles it: the question and its answer enter the Project together. A Term it merely uses does not have to be Approved first. A Draft marked Needs Review cannot be approved until the mark is cleared. An Approved Knowledge Item is never edited: any change to it, even a small one, is a Supersession. Approving confirms the version the Member saw: a Draft edited since then cannot be approved until they look at it again.
_Avoid_: Accepted, Confirmed, Published

**Rejected**:
A Draft a person has turned down as not true for the Project, optionally with a reason. It is kept so that Agents can tell when they are about to record it again, but it is not part of the Project's knowledge and searches leave it out. It never becomes Approved.
_Avoid_: Declined, Deleted, Discarded

**Deletion**:
Removing a Draft that was recorded by mistake, such as under the wrong Kind or twice. Unlike a Rejection, it says nothing about whether the knowledge is true, and it leaves no trace; its Knowledge Key is never reused. Only a Draft can be deleted: an Approved Knowledge Item is superseded or retired instead.
_Avoid_: Discard, Withdraw, Reject (for a mistake)

**Obsolete**:
A Knowledge Item that is no longer true for the Project. It becomes Obsolete only by a person's decision, through a Supersession or a Retirement, and is kept for history: searches leave it out, but it can still be reached by its id or through the chain of Supersessions.
_Avoid_: Deprecated, Outdated, Archived

**Supersession**:
Approving a new Knowledge Item of the same Kind in place of an Approved one. The old one becomes Obsolete at that moment and is "superseded by" the new one. The new one names the item it replaces from the moment it is recorded, as a Draft, so anyone who may record Drafts can propose a replacement, while approving it stays a Maintainer's. If the item it replaces is no longer Approved by then (another replacement was approved first, or it was retired), the approval is refused rather than aimed at the newer item. A Project has one Approved Product Overview, which changes only this way.
_Avoid_: Replacement, New version

**Retirement**:
A person marking an Approved Knowledge Item Obsolete with nothing to replace it, for example when a feature is dropped.
_Avoid_: Delete, Archive

**Needs Review**:
A mark that a Knowledge Item may no longer be true because a Knowledge Item it depends on, or a Decision it is justified by, was superseded, retired or rejected, or the Feature it is part of was retired or rejected. A Term it merely uses does not mark it: terms are used widely, and marking everything on each refinement would bury the marks that matter. It does not change the status, and searches show it alongside the Knowledge Item. It is cleared by confirming the knowledge still holds, by editing a Draft's Links so that it no longer rests on what changed (other edits leave the mark), by rejecting it while it is a Draft, or by a Supersession or Retirement once it is Approved. Confirming also moves the Links that caused the mark: onto the replacement of a superseded target, or away altogether from a retired or rejected one, since the person has just checked that the knowledge holds on that basis. A replacement that says the same and only adds Links marks nothing: what rested on the replaced item moves onto the replacement at once, since nothing it rested on has changed. Likewise what uses a replaced Term moves onto its replacement at once, unmarked: a word means what its current Term says. So do the parts of a replaced Feature: rewording a capability rarely makes its parts untrue, and narrowing its scope is a contradiction for an Analysis Run to find. These moves and Feature Assignment are the only changes an Approved Knowledge Item's Links ever get.
_Avoid_: Stale, Suspect, Outdated

### Context for agents

**Context Pack**:
The Approved knowledge an agent needs for one task, gathered from its Anchors along the Links: what they rest on, at any depth, the Feature an Anchor is part of included; the Business Rules that depend on any of those or are part of a Feature among them, which the code must keep; what rests on the Anchors, one step back; the Terms they use; what conflicts with them; and the Open Questions about them. A Feature as an Anchor brings in its parts, each gathered from as if it were an Anchor itself. Each Knowledge Item in it has a role (Anchor, part, foundation, rule, may be affected, term, conflict, unsettled), and one under Needs Review is marked as such. Drafts are never part of it, only named when linked nearby (a Draft merely using one of its Terms is not).
_Avoid_: Task Context, Brief, Bundle

**Anchor**:
An Approved Knowledge Item an agent picks as the subject of its task, from which a Context Pack is gathered. A Draft cannot be an Anchor: it has to be approved first.
_Avoid_: Root, Seed, Entry point

**Project Frame**:
The knowledge that holds for every task in a Project, whatever it links to: the Product Overview, every Approved Constraint, every Approved non-functional Requirement and every Approved Decision about architecture. An agent reads it once per session, alongside the Context Packs of its tasks.
_Avoid_: Project Context (that is a document), Global context

### Analysis

**Gap**:
Something missing from a Project's knowledge that Intentra sees without judgement, such as an Approved Knowledge Item with no Link, a Requirement without acceptance criteria or an empty field of its Kind. A Gap is never stored: it is found anew from the knowledge each time, and disappears once the knowledge is completed; a Draft already closes it, since someone has thought of it. What takes judgement (a contradiction, an ambiguity, a doubtful rule) is not a Gap: it is recorded as a Draft Open Question that `concerns` the items, or as a `conflicts-with` Link.
_Avoid_: Finding, Issue, Warning, Problem
