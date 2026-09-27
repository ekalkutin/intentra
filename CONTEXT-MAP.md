# Context Map

## Contexts

- IAM (`contexts/iam`): who a person is: accounts, sign-up and sign-in; knows nothing about workspaces or roles
- [Workspace](./contexts/workspace/CONTEXT.md): workspaces (the tenant), their members and roles, and the projects inside them
- [Agents](./contexts/agents/CONTEXT.md): agent profiles a workspace configures and, later, their runs

## Relationships

- **All contexts ↔ Workspace**: every context stores `WorkspaceId` (shared kernel) on its data; a workspace is the isolation boundary for everything
- **All contexts ↔ Workspace**: project-scoped data references a project by `ProjectId` (shared kernel)
- **IAM → Workspace**: a member refers to an account by its id; IAM never asks what a person may do
