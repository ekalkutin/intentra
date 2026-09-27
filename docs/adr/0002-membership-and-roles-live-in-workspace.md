# Membership and roles live in the Workspace context, not in IAM

A person can belong to several workspaces with a different role in each, so "who may do what" is always asked about a specific workspace. We keep members, invitations and roles in the Workspace context next to the workspace they belong to, and keep IAM to identity only (accounts, sign-up, sign-in). The PRD puts access control in a separate context; we don't split it out until its rules outgrow the Workspace context.

## Consequences

- Every context that checks permissions asks the Workspace context, not IAM, even though the name "IAM" suggests access.
- If roles and policies grow into a model of their own, they are the first candidate to become a separate context.
