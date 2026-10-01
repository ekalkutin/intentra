# Agents are versioned data that a Platform Admin edits and publishes at runtime

Intentra still alone designs its Agents ([ADR 0001](./0001-agents-designed-by-intentra.md)), but they no longer live in code. Everything that shapes how the Agents behave is data: their instructions, Intentra's own Skills, the built-in Model Profiles and which one each Agent runs on, which Specialists exist with the tools each may use, and which of them the Orchestrator may call. A Platform Admin edits it in the admin area as the Unpublished Agents, tries it in their own Conversations, and publishes it as a new numbered Agents Version, which becomes the Published Agents every Workspace works with. We did it this way because tuning prompts and models needs a short loop without a deploy, while one shared set of Agents means every mistake reaches every Workspace at once, so nothing changes for customers without being tried and published first.

## Considered Options

- **Agents stay in code, changed by commit and deploy.** Rejected: git is a good prompt editor with history and review, but every tuning step waits for a deploy.
- **Hybrid: the shape of the Agents (which Agents and tools) in code, only their texts in data.** Rejected: adding or removing a Specialist would still need a deploy, and the boundary between "code" and "data" would need constant care.
- **Edits go live at once, with only a history to roll back.** Rejected: a typo in a prompt or a wrong model reaches every customer before anyone has seen it.
- **A separate version per Agent or per Skill.** Rejected: an Orchestrator could be published calling a Specialist that is not; one version for all Agents keeps them consistent.

## Consequences

- Tools stay in code (`libs/agent-toolkit`). The tool catalog becomes a contract between code and data: an Agents Version that names a tool missing from the code cannot be published, and removing a tool from the code must not leave a Published Agents Version pointing at it.
- An Agent keeps its identity across Agents Versions however its name, instructions or tools change. Workspaces link their Skills and Model Profile to that identity (Agent Settings); when an Agent is no longer published, those links are deleted in every Workspace, and bringing the Agent back does not restore them.
- An Agents Version never changes after publishing. Going back means publishing an earlier Agents Version again as the next one.
- Each answer runs on the Agents as published at the moment of the message, and Usage records the Agents Version, so the cost of a change in the Agents can be seen.
- The Agents start from nothing, with no seed from code: a Platform Admin creates the Orchestrator and publishes Agents Version 1, and until then no Workspace's Agents work. The Orchestrator that lived in code (`orchestrator-instructions.ts`, the model from `AGENT_MODEL`) is kept in `docs/agents/orchestrator.md` to paste in. A seed was dropped on 2026-10-01: it added a version made by nobody and a write on first read, for a setup a Platform Admin does once.
- What depends on rights stays in code: the code frames the instructions from data with the Project and the rules of the Member's Project Role, and leaves out the tools that write for a Viewer. An edit in the admin area can change how the Agents work, never what they may do.
- Specialists are Mastra supervisor sub-agents of the Orchestrator, built per request from the Agents Version, rather than an Agent Network, so the chat and its stream do not change.
