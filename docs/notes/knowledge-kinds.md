# Project Knowledge: starting set of Kinds

Agreed on 2026-09-29 as a starting point; fields may change freely until there is data. Glossary: `packages/workspace/src/subdomains/knowledge/CONTEXT.md`.

Every Knowledge Item has the common frame: Knowledge Key, title, status, Source with Rationale, Links, and who approved / rejected / superseded / retired it and when. The table lists only the fields of each Kind.

There is no free-text description in the frame (decided on 2026-09-29): what a Knowledge Item says always lives in a typed field of its Kind, so a missing field is a gap anyone can see without an LLM, as ADR 0001 intends. Each Kind has one **main field** (in bold below) holding its statement; it is the only required field, so an agent never has to invent the rest. Every other field is optional, and an empty one is a gap for the agent to ask about. Searches and lists show the title and the main field. The main field of the Kinds marked _step 4_ is chosen when they are built.

| Kind             | Key prefix | Fields                                                                                                                                               |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Overview | `PO`       | _step 4_: problem, audience, value. Only one Approved per Project; changes only by Supersession                                                      |
| Goal             | `GOAL`     | _step 4_: success metric (optional)                                                                                                                  |
| Persona          | `PER`      | _step 4_: needs; a person or a system                                                                                                                |
| Scenario         | `SC`       | _step 4_: performer (a `depends on` Link to a Persona), steps, expected result                                                                       |
| Requirement      | `REQ`      | **statement**: what the system does or what quality it has; functional or non-functional; priority Must / Should / Could; acceptance criteria (list) |
| Constraint       | `CON`      | _step 4_: imposed by: law, budget, deadline, customer, company, infrastructure                                                                       |
| Term             | `TERM`     | **definition**; sort of concept: Entity / Value / Role / Action-Event / Other; synonyms to avoid                                                     |
| Business Rule    | `BR`       | **rule**, in one sentence                                                                                                                            |
| Integration      | `INT`      | _step 4_: external system; direction (we → them, them → we, both); what is exchanged                                                                 |
| Decision         | `DEC`      | area: architecture / product / business; context; **decision**; rejected alternatives (each with a reason)                                           |
| Open Question    | `TBD`      | _step 4_: none; answered once an Approved Knowledge Item `answers` it                                                                                |
