# IAM — open questions and deferred ideas

## Deferred (post-MVP)

- **Revocable refresh tokens.** MVP: access and refresh tokens are stateless JWTs returned in the response body; the access token travels as `Authorization: Bearer`. A refresh token cannot be revoked and stays valid until it expires, and logout only means the client forgets its tokens. Later: store refresh sessions in Redis with a TTL, delete the key on logout, keep an Account's session keys in one set for "log out everywhere", and rotate the refresh token on every refresh.
- **Email verification.** See [workspace open questions](workspace-open-questions.md): an Invitation relies on the email being owned by the Account.
- **Access for MCP agents.** Decided on 2026-09-29: a Personal Access Token belongs to a Member and lives in the Workspace context, not in IAM (like Linear or Slack, unlike Atlassian's account-wide tokens). OAuth for MCP may come later on top of the same model.
- **Deleting an Account.** Decided on 2026-10-01: for now a Platform Admin can only block and unblock an Account (Blocked Account). Deleting one, by a Platform Admin or on the person's own request, needs its own grilling: what happens to its Members, the Knowledge Items it authored, its Conversations, and a Workspace where it is the last Owner.
