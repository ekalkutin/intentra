# Project Knowledge: open questions

Deferred on purpose. Glossary: `packages/workspace/src/subdomains/knowledge/CONTEXT.md`.

- **Approving by Kind.** Decided on 2026-09-29: a Project's Maintainers approve, reject, supersede and retire every Kind. Later, if teams need "only certain people approve Decisions", add owners per Kind on top of Project Roles (like GitHub CODEOWNERS), not job-title roles. What to lay down now: every approve / reject / supersede / retire goes through one permission check given the Member, the Project and the Kind; every Knowledge Item records who approved, rejected, superseded or retired it and when.
- **Approving over MCP.** An external agent may approve, reject, supersede or retire on a Member's behalf only when the Member's personal access token allows it; that permission is off by default. Decided on 2026-09-29: the Personal Access Token (Workspace context) has three levels, and only the highest lets the agent approve. Intentra's own Agents have no tool to approve at all.
- **Links to external artifacts.** A Source from an external agent could also point to a commit, pull request or file it came from. Comes with Planning (Commit / PR / Test evidence).
- **Activity log.** Decided on 2026-09-30: a Knowledge Item keeps one named field pair per lifecycle transition (each happens at most once), not a list of events. A feed of what happened in a Project (edits, approvals, Needs Review confirmations, which can repeat) would be its own append-only collection written from domain events, not an array inside each Knowledge Item.
