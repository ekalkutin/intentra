# The tools of Intentra's agents call published APIs of other contexts

Intentra's own agents run inside the Agents context: it holds their profiles and the workspace's OpenRouter key, and the key must not leave it. Their tools read other contexts (a workspace's list, later a project's knowledge). So the Agents context calls the published APIs of IAM and Workspace (`ToolApis`), which the composition root hands to `AgentsModule` in its options. This is an exception to ADR-0001: the gateway still checks that the person is a member of the workspace before the chat starts, and every tool runs on behalf of that same person (`Caller`), so the check is not repeated inside the context.

## Considered Options

- **Run the agents in the gateway, like MCP.** Keeps ADR-0001 whole, but the decrypted key would cross `AgentsApi` (and the network, with micro-services), and the gateway would hold model logic instead of transport.

## Consequences

- Only tools call other contexts, and only through their published APIs (`ToolApis`); the rest of the Agents context does not.
- A tool acts as the person in the chat: it may reach only what that person may reach through the same APIs.
- With micro-services, the Agents context needs HTTP clients of the IAM and Workspace APIs.
