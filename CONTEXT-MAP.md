# Context Map

## Contexts

- [Workspace](./packages/workspace/CONTEXT.md): top-level space that groups people and projects

## Relationships

- **Workspace → other contexts**: Workspace owns the Project itself (identity, name, which Workspace it belongs to). Everything inside a Project lives in other contexts and refers to it by its id.
- **IAM → Workspace**: IAM knows nothing about Workspaces. An Account can exist without any Workspace; it gets one by creating it or joining an existing one.
