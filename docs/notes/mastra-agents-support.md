# What Mastra gives the Agents context out of the box

Checked on 2026-09-29 against `@mastra/core@1.71.0` (paths relative to its `dist/`).

- **Skills.** `createSkill({ name, description, instructions })` from `@mastra/core/skills` builds a skill in memory (no filesystem). `new Agent({ skills })` accepts a resolver `({ requestContext }) => SkillInput[]`, so a Workspace's Skills can be loaded from MongoDB per request. The agent gets `skill` / `skill_search` / `skill_read` tools: it sees names and descriptions and reads the body on demand. Limits: name 1-64 chars `[a-z0-9-]`, description 1-1024; `validateSkillMetadata` / `validateSkillContent` are exported. Needs `>= 1.46.0`. Docs: https://mastra.ai/docs/skills, https://mastra.ai/reference/agents/createSkill
- **Per-request config.** `instructions`, `model`, `tools`, `agents`, `memory` etc. are `DynamicArgument<T>`: a value or `({ requestContext, mastra }) => T` (`types/dynamic-argument.d.ts`).
- **Orchestrator and Specialists.** `new Agent({ agents })` (also dynamic): each sub-agent is exposed to the parent as a tool built from its description (`agent/subagent.d.ts`). A sub-agent without its own memory uses the parent's.
- **OpenRouter with a Workspace's key.** `model: async ({ requestContext }) => ({ id: 'openrouter/<vendor>/<model>', apiKey })` (`OpenAICompatibleConfig`, `llm/model/shared.types.d.ts`). Without `apiKey` it reads `OPENROUTER_API_KEY`.
