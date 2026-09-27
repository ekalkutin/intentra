# Workspace is the tenant; there is no Organization or Portfolio

The PRD describes Organization as the tenant, with Workspace as an optional grouping and Portfolio beside it. We collapse these into one concept: **Workspace** is the top-level space and the tenant boundary. Every object belongs to exactly one workspace and never references data of another; `WorkspaceId` therefore lives in the shared kernel. One term is simpler for users and for the model, and it matches the tools our users already know (Slack, Notion, Linear).

## Consequences

- There is no level above a workspace. A company that wants several workspaces under shared billing or SSO is not supported; if that need appears, add a grouping above workspaces then, without changing the tenant boundary.
- The PRD still says Organization and Portfolio; where it disagrees, this ADR wins.
