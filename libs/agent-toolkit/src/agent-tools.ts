import { AGENT_TOOLS, type AgentTool } from './catalog.js';
import {
  reportingFailures,
  type UnexpectedErrorListener,
} from './intentra/reporting-failures.js';

/** An Agent's tools by id, from `AGENT_TOOLS`; an id the code no longer has is left out. */
export function agentToolsOf(
  toolIds: readonly string[],
  onUnexpectedError: UnexpectedErrorListener,
): Record<string, AgentTool> {
  return reportingFailures(
    Object.fromEntries(
      toolIds.flatMap(id => {
        const tool = (AGENT_TOOLS as Record<string, AgentTool | undefined>)[id];

        return tool ? [[id, tool]] : [];
      }),
    ) as Record<string, AgentTool>,
    onUnexpectedError,
  );
}
