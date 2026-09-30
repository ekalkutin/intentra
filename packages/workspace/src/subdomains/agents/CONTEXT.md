# Agents

A subdomain of the Workspace context (see `CONTEXT-MAP.md`). Intentra's own AI agents: what a Workspace may tune in them and how they work with its people.

## Language

**Agent**:
An AI assistant that Intentra provides to every Workspace. It has a name, a description, a model configuration, instructions, Skills and the tools it may use. Intentra alone designs its Agents; a Workspace cannot create, copy or remove them, and can only give them its own Skills and Model Profiles. An Agent is either the Orchestrator or a Specialist. In a Conversation an Agent acts on behalf of its Member and can do only what that Member may do.
_Avoid_: Bot, Assistant, AI, Custom agent

**Orchestrator**:
The main Agent, and the only one people talk to. It hands parts of the work to Specialists.
_Avoid_: Main agent, Router, Supervisor

**Specialist**:
An Agent that helps the Orchestrator with one area of expertise. People do not talk to it directly.
_Avoid_: Sub-agent, Helper, Worker

**Skill**:
A named piece of know-how an Agent can draw on for a particular kind of task, written in markdown with a description of when to use it. An Agent always sees the names and descriptions of its Skills and reads a Skill's text only when a task calls for it. An Agent comes with Intentra's own Skills, which a Workspace cannot change or remove. The Owners keep the Workspace's own Skills in one library and gives each Agent the ones it should use; a Skill given to several Agents is written once. Deleting a Skill takes it away from every Agent that had it. A Skill's name is unique within its Workspace; names starting with `intentra-` belong to Intentra's own Skills, so a Workspace's Skill can never clash with one.
_Avoid_: Prompt, Plugin, Instruction

**Provider Key**:
A Workspace's own key to an LLM provider, added by an Owner. For now the only provider is OpenRouter, so a Workspace has at most one Provider Key. It lets Owners create the Workspace's own Model Profiles, which run at the Workspace's cost. Agents without such a Model Profile run on Intentra's models at Intentra's cost.
_Avoid_: API key, BYOK key, Token

**Conversation**:
A private exchange between one Active Member and the Orchestrator within a Workspace. Only that Member sees it. The Orchestrator in it may do only what the Member's Project Role allows: with a Viewer it answers questions but records nothing. What the team shares is the knowledge the Agents record from it, not the Conversation itself. For now a Conversation always takes place in a Project. It is deleted with its Project, and when its Member leaves or is removed.
_Avoid_: Chat, Session, Thread, Interview

**Model Profile**:
A named choice of model and its tuning (temperature, reasoning effort, maximum response length) that an Agent runs on, such as "Fast" or "Smart". Intentra has several built-in Model Profiles on its own models and assigns them to its Agents itself; a Workspace can neither change nor pick them. An Owner whose Workspace has a Provider Key can create the Workspace's own Model Profiles, which run on that key. When the Provider Key is removed, the Workspace's own Model Profiles stay but cannot run, and neither can the Agents set to them, until an Owner adds a key again or changes those Agents' settings. An Agent never silently falls back to Intentra's models. A Model Profile cannot be deleted while any Agent is set to it.
_Avoid_: Model config, Preset, Tier, Runtime

**Agent Settings**:
What a Workspace has chosen for one Agent: which of the Workspace's own Skills it uses and one of the Workspace's own Model Profiles. Without settings an Agent works exactly as Intentra designed it, on the built-in Model Profile Intentra assigned to it.
_Avoid_: Agent config, Overrides
