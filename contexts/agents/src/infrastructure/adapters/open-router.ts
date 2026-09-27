import type { MastraModelConfig } from '@mastra/core/llm';

export const OPEN_ROUTER_URL = 'https://openrouter.ai/api/v1';

/**
 * An explicit provider config rather than Mastra's `openrouter/…` string: the
 * string would read the key from `process.env`, and here every workspace has
 * its own.
 */
export const openRouterModel = (
  modelId: string,
  apiKey: string,
): MastraModelConfig => ({
  providerId: 'openrouter',
  modelId,
  url: OPEN_ROUTER_URL,
  apiKey,
});
