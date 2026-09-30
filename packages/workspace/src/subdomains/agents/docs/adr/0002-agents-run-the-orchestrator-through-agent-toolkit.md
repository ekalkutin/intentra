# The Agents subdomain runs the Orchestrator, with agent-toolkit and Mastra Memory in its infrastructure

The Agents subdomain owns Conversations and answering in them: whose a Conversation is, hiding, renaming, deleting, and the use case "a Member sends a message, the Orchestrator answers". Its infrastructure runs the Orchestrator with `libs/agent-toolkit` (the Mastra `Agent`, the tools, the model) and keeps Conversations in Mastra Memory (`@mastra/memory` with `@mastra/mongodb`, Mastra's own collections). A Conversation is a Mastra thread (`resourceId` is the Member, `metadata` holds the Workspace and the Project); there is no Conversation record of our own. We did it this way because in Mastra an agent and its memory are one thing: the agent writes its own thread, so splitting them would put one Conversation in two places.

This makes a loop that looks like a mistake and is not one. The application of Agents calls its infrastructure, which calls the LLM, whose tools call back into Knowledge, Projects and Access. We treat the LLM as an outside system that calls back through the published sub-APIs, like a webhook, the same way an external agent does over MCP, with the same access checks. Two rules keep the loop from turning into a dependency cycle:

- The tools get only the sub-APIs they use (`{ knowledge, projects, access }`), never the whole `WorkspaceApi`, which includes Agents itself.
- `CleanupAdapter` deletes threads through the Conversation store, never through the Agents service, which depends on the Orchestrator, which depends on `ProjectsService`, which depends on `Cleanup`.

## Considered Options

- **The Orchestrator as an inbound adapter beside the gateway, like MCP**, with the Agents subdomain owning only the Conversation rules and store. Rejected: the Mastra agent writes to its memory itself, so two places would touch one store, and "an answer is in progress" and "finish the answer even if the client left" would become gateway logic.
- **A separate `libs/agent-runtime` behind a port.** Rejected: the same loop, plus one more library and wiring in `apps/api`, only so that `packages/workspace` does not depend on Mastra.
- **Our own Conversation aggregate, Mastra only for messages.** Rejected: two records for one Conversation. The list, the ownership check and deletion go through Mastra's thread instead.

## Consequences

- Mastra does not take part in our transactions. Threads are deleted inside the `UnitOfWork` together with everything else. If the transaction rolls back, the threads are gone anyway. That is accepted: the value is in the Knowledge recorded from a Conversation, not in the messages.
- A Conversation's shape (messages, tool parts) is Mastra's and AI SDK's, not ours: the stream and the history are served in the AI SDK UI message format rather than in zod schemas of our own.
