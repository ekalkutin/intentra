# IAM

Identity of the people using Intentra: who they are and how they prove it.

## Language

**Account**:
A person's identity in Intentra, identified by a unique email and protected by a password.
_Avoid_: User, profile

**Display name**:
How an Account is shown to other members. Optional; until it is set, the email stands in for it.
_Avoid_: Username, full name, nickname

**Sign up**:
Creating a new Account; the person is signed in right away.
_Avoid_: Register, registration

**Sign in**:
Proving ownership of an Account with its email and password.
_Avoid_: Login, log in, authenticate

**Personal Access Token**:
A named, long-lived secret an Account creates for an MCP agent to act on its behalf. Optionally expires; can be revoked.
_Avoid_: API key, PAT (in code names), MCP token

**Revoke**:
Permanently disabling a Personal Access Token before it expires.
_Avoid_: Delete, disable
