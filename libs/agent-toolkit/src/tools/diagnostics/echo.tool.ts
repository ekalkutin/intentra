import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/** A test tool for checking that an agent reaches Intentra. */
export const echoTool = createTool({
  id: 'echo',
  description: 'Returns the given message unchanged.',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ message: z.string() }),
  mcp: { annotations: { readOnlyHint: true } },
  execute: async ({ message }) => ({ message }),
});
