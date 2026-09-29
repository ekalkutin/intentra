# One Knowledge Item aggregate for every Kind

All Project Knowledge is one aggregate, Knowledge Item, stored in one collection: a common frame (Knowledge Key, status, Source, Links, approval history) plus the typed fields of its Kind, as a union discriminated by the Kind. Every Kind shares the same lifecycle (Draft, Approved, Rejected, Obsolete through Supersession or Retirement, Needs Review), so writing that lifecycle once beats repeating it in eleven aggregates, and Links, Needs Review and cross-Kind search stay within one collection.

## Considered Options

- **One aggregate per Kind** (`Requirement`, `Term`, `Decision`, ...). Rejected: about eleven near-identical aggregates, repositories and collections repeating one lifecycle. Its strongest argument, that Kinds have different lifecycles, did not hold once the lifecycle was agreed.
- **Untyped markdown with a Kind label.** Rejected: gaps such as a Requirement without acceptance criteria could not be found without an LLM, and documents could not be built from fields.

## Consequences

- Tools for agents are still typed per Kind (`record_requirement`, `record_term`, ...), generated from the same Kind schemas and split among Specialists, so no agent sees every tool.
- Rules that belong to one Kind, such as one Approved Product Overview per Project, are checks on the Kind inside the one aggregate or partial indexes.
- A Kind that grows much behaviour of its own can later move to its own aggregate.
