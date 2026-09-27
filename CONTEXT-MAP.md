# Context Map

## Contexts

- [IAM](./contexts/iam/CONTEXT.md): who a person is and how they prove it
- [Workspace](./contexts/workspace/CONTEXT.md): workspaces, their members and projects
- [Agents](./contexts/agents/CONTEXT.md): agent profiles of a workspace, its orchestrator and the chat with it

## Relationships

- **IAM → Workspace**: a Member is identified by an `AccountId` from IAM
- **Workspace → Agents**: agent profiles and the OpenRouter key belong to a workspace via `WorkspaceId`
- **Agents → IAM, Workspace**: the tools of the agents read their published APIs on behalf of the person in the chat ([ADR-0002](./docs/adr/0002-agent-tools-call-published-apis.md))
