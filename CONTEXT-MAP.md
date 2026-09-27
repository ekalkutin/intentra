# Context Map

## Contexts

- [IAM](./contexts/iam/CONTEXT.md): who a person is and how they prove it
- [Workspace](./contexts/workspace/CONTEXT.md): workspaces, their members and projects
- Agents (`contexts/agents`): agent profiles configured per workspace

## Relationships

- **IAM → Workspace**: a Member is identified by an `AccountId` from IAM
- **Workspace → Agents**: agent profiles belong to a workspace via `WorkspaceId`
