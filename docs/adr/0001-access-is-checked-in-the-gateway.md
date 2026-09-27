# Access is checked in the gateway; contexts trust the account id

The gateway is the only way in, so it does both authentication (who calls: the token) and authorization (what they may reach: workspace membership, later roles). To decide, it asks the context that owns the rule through its published API, such as `WorkspaceApi` for members. Contexts take the `accountId` they are given and trust it; they do not repeat the check and do not ask each other.

## Considered Options

- **Each context checks access itself.** Safe even when called around the gateway, but a context such as Agents would need Workspace's members, and contexts integrate only through published events. That means an event bus, an outbox and a local copy of members in every consumer — too much while the gateway is the only door.

## Consequences

- Nothing may reach a context except through the gateway.
- MCP tools run inside the gateway, so a check such as "the tool is called in a workspace the caller may use" belongs to the MCP adapter, before the tool runs.
- A check inside a context can be added later as a second line of defence; if it needs another context's data, it gets it through events, not calls.
