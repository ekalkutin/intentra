# Agents

Owns the agents a workspace configures and their runs: who an agent is, how it is instructed, what it may use, and what it did.

## Language

**Agent Profile**:
An agent configured by a workspace: its name, instructions, model and the tools it may use. Belongs to the whole workspace, not to a project; built-in and custom agents are both profiles.
_Avoid_: Agent config, Bot, Assistant

**Tool**:
A capability an agent may be allowed to call, such as searching project knowledge. A profile lists the tools it may use; nothing else is available to it.
_Avoid_: Skill, Plugin, Function
