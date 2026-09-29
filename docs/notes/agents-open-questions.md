# Agents: open questions

Deferred on purpose. Glossary: `packages/workspace/src/subdomains/agents/CONTEXT.md`.

- **Usage limits on Intentra's models.** A Workspace without a Provider Key runs on Intentra's models at Intentra's cost. Limits, plans or a trial quota come later.
- **More LLM providers.** For now a Provider Key can only be an OpenRouter key. Later: direct keys to Anthropic, OpenAI and others. Options discussed on 2026-09-29: one key per Workspace, one key per provider (a Model Profile names its provider; mixing providers is allowed), or any number of keys with a Model Profile naming its key (for splitting costs). One key per provider was the preferred option.
- **Conversations outside a Project.** For the MVP a conversation always lives in a Project. Later, two growth paths, and the model must not block them:
  - *Idea → Project ("wow" start):* a conversation starts in the Workspace with no Project, the Orchestrator asks what is being built, offers to create the Project, creates it after the Member confirms, and the conversation is attached to it for good (once, one way). Right after, the Agent records what it already learned. Open: only the Owner may create a Project today, so what happens when a Contributor starts such a conversation; and what happens to abandoned conversations that never got a Project.
  - *Cross-project questions:* a Workspace-level conversation reads across Projects ("which of our projects integrate with Stripe?") and writes nothing. Open: filtering by per-Project access once it exists.
  - What to lay down now: a conversation always records its Workspace, and its Project separately; Agents and tools take the scope (Workspace, Project) from the request context, never assume a Project is there.
