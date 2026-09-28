# Context Map

## Contexts

- [IAM](./packages/iam/CONTEXT.md): Accounts and how they prove who they are
- [Workspace](./packages/workspace/CONTEXT.md): top-level space that groups people and projects

## Relationships

- **Workspace → other contexts**: Workspace owns the Project itself (identity, name, which Workspace it belongs to). Everything inside a Project lives in other contexts and refers to it by its id.
- **IAM → Workspace**: IAM knows nothing about Workspaces. An Account can exist without any Workspace; it gets one by creating it or joining an existing one.
- **IAM → all contexts**: IAM authenticates each request and hands the other contexts an Actor (the Account's id and email). Contexts trust the Actor and never call IAM to look an Account up.
