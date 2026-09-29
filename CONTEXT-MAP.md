# Context Map

## Contexts

- [IAM](./packages/iam/CONTEXT.md): Accounts and how they prove who they are
- [Workspace](./packages/workspace/CONTEXT.md): top-level space that groups people and projects
- [Project Knowledge](./packages/knowledge/CONTEXT.md): the structured model of what a Project is (not built yet)
- [Agents](./packages/agents/CONTEXT.md): Intentra's own AI agents that work with people on a Project. External agents (Codex, Claude Code, Cursor) reaching Intentra over MCP are not part of it

## Relationships

- **Workspace → other contexts**: Workspace owns the Project itself (identity, name, which Workspace it belongs to). Everything inside a Project lives in other contexts and refers to it by its id.
- **Workspace → Agents**: Agents are the same for every Workspace; Intentra alone designs them. A Workspace's Agent Settings, Skills, Model Profiles and Provider Key refer to it by its id; a Conversation refers to its Workspace, Project and Member by their ids.
- **Agents → Project Knowledge**: Agents record what they learn in a Conversation as Drafts. Only a person approves them; an Agent never does.
- **IAM → Workspace**: IAM knows nothing about Workspaces. An Account can exist without any Workspace; it gets one by creating it or joining an existing one.
- **Two ways in**: people work with Intentra through its web UI and, just as fully, through external agents (Claude Code, Codex, Cursor) over MCP. An external agent acts on behalf of one Member, authenticated by a Personal Access Token the Member creates in the Workspace; what it may do is limited further by that token.
- **IAM → all contexts**: IAM authenticates each request from the web UI and hands the other contexts an Actor (the Account's id and email). A request over MCP is authenticated by Workspace instead, from a Personal Access Token, and yields the same Actor; IAM never learns about Personal Access Tokens. Contexts trust the Actor and never call IAM to look an Account up. Workspace keeps a copy of a Member's email, taken from the Actor when the Member joins.
