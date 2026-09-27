import type {
  OpenRouterKeyDto,
  SetOpenRouterKeyDto,
} from './open-router-key.dto.js';

/**
 * The OpenRouter key every agent of a workspace runs on. Reached through
 * `AgentsApi.openRouterKeys`. Stored encrypted and never returned.
 */
export interface OpenRouterKeysApi {
  /** `null` while the workspace has no key. */
  find(workspaceId: string): Promise<OpenRouterKeyDto | null>;
  /** Sets the key or replaces the one there is. */
  set(
    workspaceId: string,
    data: SetOpenRouterKeyDto,
  ): Promise<OpenRouterKeyDto>;
  /** Throws `OPEN_ROUTER_KEY_NOT_FOUND` (404) when there is no key. */
  remove(workspaceId: string): Promise<void>;
}
