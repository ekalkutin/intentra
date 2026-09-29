# Intentra alone designs the Agents; a Workspace only adds Skills and Model Profiles

Every Workspace gets the same Agents (one Orchestrator and its Specialists), designed and updated by Intentra. A Workspace cannot create, copy, change or remove an Agent, nor change which Specialists the Orchestrator may call. The Owner can only give Agents the Workspace's own Skills and, with a Provider Key, the Workspace's own Model Profiles. How to put the Agents together is Intentra's product, not something each Workspace should have to get right, and this way every improvement Intentra makes reaches every Workspace at once.

## Considered Options

- **Agents copied from Intentra's templates, then owned by the Workspace.** Rejected: improvements to a template never reach the copies, and a Workspace that broke its Agents needs a "factory reset".
- **Intentra's Agents read-only, plus the Workspace's own Agents and copies, arranged in a per-Workspace lineup.** Rejected: it puts agent design on the Owner, adds a lineup to manage and reset, and a copy stops getting Intentra's improvements.
- **Per-field overrides on top of Intentra's Agents.** Rejected: overridden fields can silently stop matching instructions Intentra rewrites later.

## Consequences

- The Agents subdomain stores no Agents per Workspace, only Agent Settings, Skills, Model Profiles and the Provider Key.
- Customisation that goes beyond Skills and Model Profiles is a change to Intentra's own Agents, not a Workspace setting.
