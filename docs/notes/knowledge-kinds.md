# Project Knowledge: starting set of Kinds

Agreed on 2026-09-29 as a starting point; fields may change freely until there is data. Glossary: `packages/workspace/src/subdomains/knowledge/CONTEXT.md`.

Every Knowledge Item has the common frame: Knowledge Key, title, markdown description, status, Source with Rationale, Links, and who approved / rejected / superseded / retired it and when. The table lists only the fields of each Kind.

| Kind             | Key prefix | Fields                                                                                                     |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| Product Overview | `PO`       | problem, audience, value. Only one Approved per Project; changes only by Supersession                      |
| Goal             | `GOAL`     | success metric (optional)                                                                                  |
| Persona          | `PER`      | needs; a person or a system                                                                                |
| Scenario         | `SC`       | performer (a `depends on` Link to a Persona), steps, expected result                                       |
| Requirement      | `REQ`      | functional or non-functional; priority Must / Should / Could; acceptance criteria (list)                   |
| Constraint       | `CON`      | imposed by: law, budget, deadline, customer, company, infrastructure                                       |
| Term             | `TERM`     | definition; sort of concept: Entity / Value / Role / Action-Event / Other; synonyms to avoid               |
| Business Rule    | `BR`       | the rule in one sentence                                                                                   |
| Integration      | `INT`      | external system; direction (we → them, them → we, both); what is exchanged                                 |
| Decision         | `DEC`      | area: architecture / product / business; context; the decision; rejected alternatives (each with a reason) |
| Open Question    | `TBD`      | none; answered once an Approved Knowledge Item `answers` it                                                |
