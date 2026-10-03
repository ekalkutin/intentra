# Project Knowledge: starting set of Kinds

Agreed on 2026-09-29 as a starting point; fields may change freely until there is data. Glossary: `packages/workspace/src/subdomains/knowledge/CONTEXT.md`.

Every Knowledge Item has the common frame: Knowledge Key, title, status, Source with Rationale, Links, and who approved / rejected / superseded / retired it and when. The table lists only the fields of each Kind.

There is no free-text description in the frame (decided on 2026-09-29): what a Knowledge Item says always lives in a typed field of its Kind, so a missing field is a gap anyone can see without an LLM, as ADR 0001 intends. Each Kind has one **main field** (in bold below) holding its statement; it is the only required field, so an agent never has to invent the rest. Every other field is optional, and an empty one is a gap for the agent to ask about. Searches and lists show the title and the main field. Main fields of the Kinds added in step 4 were agreed on 2026-09-30.

| Kind             | Key prefix | Fields                                                                                                                                                   |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Overview | `PO`       | **summary**: what the product is and for whom, in a few sentences; problem, audience, value. Only one Approved per Project; changes only by Supersession |
| Goal             | `GOAL`     | **outcome**: what the Project wants to achieve; success metric                                                                                           |
| Persona          | `PER`      | **profile**: who they are; a person or a system; needs (list)                                                                                            |
| Feature          | `FEAT`     | **capability**: what users can do with it and what they get; out of scope (list): what it deliberately does not do (agreed 2026-10-03)                   |
| Scenario         | `SC`       | **expected result**: what the performer gets in the end; steps (list); performer (a `depends on` Link to a Persona, step 6)                              |
| Requirement      | `REQ`      | **statement**: what the system does or what quality it has; functional or non-functional; priority Must / Should / Could; acceptance criteria (list)     |
| Constraint       | `CON`      | **constraint**: what is imposed; imposed by: law, budget, deadline, customer, company, infrastructure                                                    |
| Term             | `TERM`     | **definition**; sort of concept: Entity / Value / Role / Action-Event / Other; synonyms to avoid                                                         |
| Business Rule    | `BR`       | **rule**, in one sentence                                                                                                                                |
| Integration      | `INT`      | **purpose**: what it is for; external system; direction (we → them, them → we, both); what is exchanged                                                  |
| Decision         | `DEC`      | area: architecture / product / business; context; **decision**; rejected alternatives (each with a reason)                                               |
| Open Question    | `TBD`      | **question**: what is not settled; answered once an Approved Knowledge Item `answers` it (step 6)                                                        |
