import type { ModelDto } from './model.dto.js';

/** The models OpenRouter offers. Reached through `AgentsApi.models`. */
export interface ModelsApi {
  find(): Promise<ModelDto[]>;
}
