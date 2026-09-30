import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { ChoicesDtoSchema } from '@intentra/contracts/workspace';

/**
 * Shows the Member a question with clear-cut answers as cards to click. It
 * changes nothing: the web UI draws the cards from the call itself, and what
 * the Member picks arrives as their next message.
 */
export const offerChoicesTool = createTool({
  id: 'offer_choices',
  description:
    'Ask the person a question whose answers are clear-cut (such as a priority, a type, yes or no, or two or three concrete alternatives): they see the options as cards to click, and may type their own answer if allowCustom. Call it as the last thing in your turn, write nothing after it, and wait for their reply. Do not use it for open questions.',
  inputSchema: ChoicesDtoSchema,
  outputSchema: z.object({ shown: z.literal(true) }),
  mcp: { annotations: { readOnlyHint: true } },
  execute: async () => ({ shown: true as const }),
});
