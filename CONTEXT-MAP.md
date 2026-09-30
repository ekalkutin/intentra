# Context Map

## Contexts

- [IAM](./packages/iam/CONTEXT.md): Accounts and how they prove who they are
- **Workspace**: the top-level space that groups people, their Projects, what is known about each Project, and the AI agents that work on it. One context with one database, split into subdomains (Tenancy, Project Knowledge, Agents), each with its own glossary ([ADR 0001](./docs/adr/0001-knowledge-and-agents-are-subdomains-of-workspace.md)):
  - [Tenancy](./packages/workspace/src/subdomains/tenancy/CONTEXT.md): Workspaces, Members, Roles, Invitations, Projects, Project Roles and Personal Access Tokens: who is in a Workspace and what they may do
  - [Project Knowledge](./packages/workspace/src/subdomains/knowledge/CONTEXT.md): the structured model of what a Project is
  - [Agents](./packages/workspace/src/subdomains/agents/CONTEXT.md): Intentra's own AI agents that work with people on a Project. External agents (Codex, Claude Code, Cursor) reaching Intentra over MCP are not part of it

## Relationships

- **Inside Workspace**: Project Knowledge and Agents refer to a Workspace, Project and Member by their ids. Every subdomain checks rights through the same access policy, and deleting a Workspace, Project or Member removes what depends on it in the same transaction.
- **Agents → Project Knowledge**: Agents are the same for every Workspace; Intentra alone designs them. They record what they learn in a Conversation as Drafts. Only a person approves them; an Agent never does.
- **Agents' runtime**: running the agents (Mastra, tools, LLM providers) lives outside the context, in `libs/agent-toolkit`, and reaches it only through its published API.
- **IAM → Workspace**: IAM knows nothing about Workspaces. An Account can exist without any Workspace; it gets one by creating it or joining an existing one.
- **Two ways in**: people work with Intentra through its web UI and, just as fully, through external agents (Claude Code, Codex, Cursor) over MCP. An external agent acts on behalf of one Member, authenticated by a Personal Access Token the Member creates in the Workspace; what it may do is limited further by that token.
- **IAM → all contexts**: IAM authenticates each request from the web UI and hands the other contexts an Actor (the Account's id and email). A request over MCP is authenticated by Workspace instead, from a Personal Access Token, and yields the same Actor; IAM never learns about Personal Access Tokens. Contexts trust the Actor and never call IAM to look an Account up. Workspace keeps a copy of a Member's email, taken from the Actor when the Member joins.
