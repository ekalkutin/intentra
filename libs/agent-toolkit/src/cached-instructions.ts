import type { CoreSystemMessage } from '@mastra/core/llm';

/**
 * An Agent's instructions, marked for the provider to cache. They and the
 * tools come first in every request, each step of an answer resends them,
 * and a provider such as Anthropic caches nothing unmarked; others ignore
 * the mark.
 */
export function cachedInstructions(text: string): CoreSystemMessage {
  return {
    role: 'system',
    content: text,
    providerOptions: {
      openrouter: { cacheControl: { type: 'ephemeral' } },
    },
  };
}
