# Agents

A subdomain of the Workspace context (see `CONTEXT-MAP.md`). Intentra's own AI agents: what a Workspace may tune in them and how they work with its people.

## Language

**Agent**:
An AI assistant that Intentra provides to every Workspace. It has a name, a description, a model configuration, instructions, Skills and the tools it may use. Intentra alone designs its Agents, through a Platform Admin; a Workspace cannot create, copy or remove them, and can only give them its own Skills and Model Profiles. An Agent stays the same Agent across Agents Versions however its name, instructions or tools change; only removing it ends it, and an Agent created later is a new one even under the same name. An Agent is Intentra, the Auditor or a Specialist. In a Conversation an Agent acts on behalf of its Member and can do only what that Member may do; in an Analysis Run it acts as Intentra itself.
_Avoid_: Bot, Assistant, AI, Custom agent

**Agents Version**:
One numbered, unchangeable version of all of Intentra's Agents together: their instructions, Intentra's own Skills, the built-in Model Profiles and which one each Agent runs on, which Specialists exist and which of them Intentra may call. A Platform Admin never edits an Agents Version; publishing creates a new one, and going back means publishing an earlier one again.
_Avoid_: Agent Release, Lineup, Blueprint, Snapshot, Deployment

**Published Agents**:
The latest published Agents Version: the Agents every Workspace works with.
_Avoid_: Live agents, Production agents, Current release

**Unpublished Agents**:
The one set of Agents a Platform Admin is still editing, with Intentra's own Skills and the built-in Model Profiles; publishing it makes it the next Agents Version and the Published Agents. It always exists: it starts empty, a Platform Admin creates Intentra and everything else in it, and until the first publishing there are no Published Agents and no Workspace's Agents work. Right after publishing it is the same as the Published Agents, and every change to it, even a Skill no Agent uses yet, is unpublished until the next publishing. Only Platform Admins work with it: in their own Conversations the Agents run as the Unpublished Agents, in everyone else's as the Published Agents. Each message in a Conversation is answered by the Agents as published at that moment, so publishing in the middle of a Conversation changes how the next answer is made.
_Avoid_: Agent Draft Release, Pending Release, Release Candidate, Staging, Draft (that is a Knowledge Item)

**Intentra**:
The main Agent, and the only one people talk to: it interviews them about their product, checks what they say against the Approved knowledge, and points out gaps and contradictions. It bears the product's name, since to people it is the product: where this glossary says that Intentra designs, provides or authors something, it means the product as a whole. It hands parts of the work to Specialists. Every Agents Version has exactly one Intentra; a Platform Admin creates it once, can then change everything about it, but cannot remove it, add a second one or turn it into another sort of Agent. In a Conversation it works only in that Conversation's Project and at most as a Contributor, whatever its Member's Project Role: it records, edits and deletes Drafts and confirms a Draft marked Needs Review, and never approves, rejects, retires or confirms an Approved Knowledge Item, not even when a Maintainer asks it to.
_Avoid_: Analyst, Orchestrator, Interviewer, Main agent, Router, Supervisor

**Auditor**:
The Agent that judges for Analysis Runs. People do not talk to it, and it works without a Conversation, as Intentra itself. It has no tools: the run hands it one Knowledge Item at a time with the knowledge around it, and it answers with what it finds. Every Agents Version has exactly one Auditor; a Platform Admin creates it once, can then change everything about it, but cannot remove it, add a second one or turn it into another sort of Agent.
_Avoid_: Analyst, Inspector, Reviewer

**Specialist**:
An Agent that helps Intentra with one area of expertise. People do not talk to it directly. A Platform Admin can add and remove Specialists and choose which of them Intentra may call.
_Avoid_: Sub-agent, Helper, Worker

**Skill**:
A named piece of know-how an Agent can draw on for a particular kind of task, written in markdown with a description of when to use it. An Agent always sees the names and descriptions of its Skills and reads a Skill's text only when a task calls for it. An Agent comes with Intentra's own Skills, which a Workspace cannot change or remove. The Owners keep the Workspace's own Skills in one library and gives each Agent the ones it should use; a Skill given to several Agents is written once. Deleting a Skill takes it away from every Agent that had it. A Skill's name is unique within its Workspace; names starting with `intentra-` belong to Intentra's own Skills, so a Workspace's Skill can never clash with one.
_Avoid_: Prompt, Plugin, Instruction

**Provider Key**:
A Workspace's own key to an LLM provider, added by an Owner. For now the only provider is OpenRouter, so a Workspace has at most one Provider Key. Every model call of a Workspace's Agents runs on its Provider Key and at its cost, whichever Model Profile the Agent is on, and so does finding the meaning of its Knowledge Items for Similar Items; without one, the Workspace's Agents do not work. Intentra never runs a Workspace's Agents at its own cost for now.
_Avoid_: API key, BYOK key, Token

**Usage**:
How many tokens the Agents used in their model calls, recorded for every call with its Workspace, Agent, model and Agents Version. An Owner sees their Workspace's Usage by Agent and model; a Platform Admin sees it for every Workspace and every Agents Version. Neither sees the content of the calls. It counts tokens, not money.
_Avoid_: Cost, Spend, Consumption, Billing

**Conversation**:
A private exchange between one Active Member and Intentra within a Project. Only that Member sees it, and a Member may have any number of them in a Project. The Member always speaks first; Intentra records what it learns as Drafts right away and says in its answer which ones it recorded. Intentra in it may do only what the Member's current Project Role allows, read anew for every message: with a Viewer it answers questions but records nothing. It remembers nothing from the Member's other Conversations; what the team shares is the knowledge the Agents record from it, not the Conversation itself. It has a title, suggested by Intentra from its start and changeable by its Member. Its Member can hide it from the list, and it comes back on its own once the Member writes in it again, or delete it. It is deleted with its Project, and when its Member leaves or is removed.
_Avoid_: Chat, Session, Thread, Interview

**Analysis Run**:
One pass in which the Auditor looks over a Project's Approved knowledge and its Drafts for contradictions, ambiguities and doubtful rules, without a Conversation. It goes item by item, never by what the Auditor chooses to read: each Knowledge Item is judged together with its Similar Items and the items it is linked to, so every item of the run is looked at, linked or not. A Maintainer or Contributor starts it by hand, or it starts every night on the Project's schedule, which only a Maintainer turns on or off. Either way it looks only at the Unchecked Knowledge Items, and a scheduled one does not run at all when there are none; only a Maintainer may instead start one over the whole Project, checked or not, such as after the Agents or their models changed. Nor does a scheduled one run when it could not go ahead (no Provider Key, no Published Agents), which the schedule itself tells instead. It remembers who started it, or that the schedule did, while every Draft it records is authored by Intentra, never by a Member. It runs on the Workspace's Provider Key and records nothing but Draft Open Questions, each concerning the Knowledge Items it found at odds; deciding what is right is left to people. The Project keeps every Analysis Run: when and by whom it was started, what it looked at, the questions it recorded, or why it failed. A run that stops halfway keeps what it found; the items it did not reach stay Unchecked.
_Avoid_: Checkup, Review, Scan

**Unchecked**:
A Draft or Approved Knowledge Item that no Analysis Run has looked at since it was recorded or last changed (edited, approved, superseded or retired). The Project remembers, for each Knowledge Item, when an Analysis Run last looked at it, so it can always tell how much of its knowledge has been checked and what is left.
_Avoid_: Unaudited, Pending check, Stale

**Model Profile**:
A named choice of model and its tuning (temperature, reasoning effort, maximum response length) that an Agent runs on, such as "Fast" or "Smart". A Platform Admin defines Intentra's built-in Model Profiles and assigns one to each Agent, as part of the Agents Version like everything else about the Agents; a Workspace can neither change them nor pick another built-in one, but sees which one each Agent is on. An Owner can create the Workspace's own Model Profiles and set any Agent to one of them instead. Every Model Profile, built-in or own, runs on the Workspace's Provider Key. When the Provider Key is removed, the Workspace's own Model Profiles stay, but no Agent in the Workspace works until an Owner adds a key again. A Model Profile cannot be deleted while any Agent is set to it.
_Avoid_: Model config, Preset, Tier, Runtime

**Agent Settings**:
What a Workspace has chosen for one Agent: which of the Workspace's own Skills it uses and one of the Workspace's own Model Profiles. Without settings an Agent works exactly as Intentra designed it, on the built-in Model Profile Intentra assigned to it. Agent Settings only link an Agent to the Workspace's Skills and Model Profile; when an Agent is no longer among the Published Agents, its Agent Settings are deleted in every Workspace, while the Skills and Model Profiles themselves stay in the Workspace. Bringing that Agent back does not bring its Agent Settings back.
_Avoid_: Agent config, Overrides
