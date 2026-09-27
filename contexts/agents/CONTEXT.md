# Agents

Intentra's own AI agents: how a workspace configures them and how they answer its members.

## Language

**Agent profile**:
An agent a workspace configures: name, description, instructions, model and tools.
_Avoid_: Bot, assistant

**Orchestrator**:
The one agent profile of a workspace that talks to its members in the chat and delegates to the specialists. Made on first use; can be changed, not deleted.
_Avoid_: Supervisor, main agent, router

**Specialist**:
An agent profile the workspace creates. Only the orchestrator delegates to it.
_Avoid_: Sub-agent, custom agent, worker

**Description**:
What an agent profile is good at. The orchestrator reads it to choose whom to delegate to.

**Instructions**:
The system prompt an agent runs with.
_Avoid_: Prompt, system message

**Delegation**:
The orchestrator handing a task to a specialist and passing its answer on.

**Model**:
The OpenRouter model an agent runs on, by its OpenRouter id (`anthropic/claude-sonnet-4.5`).

**OpenRouter key**:
The API key every agent of a workspace runs on. Stored encrypted, never shown again: only its last characters.
_Avoid_: Token, secret, credentials

**Chat**:
A conversation of a member with the orchestrator. Not stored: it lives in the member's browser tab.
_Avoid_: Thread, session
