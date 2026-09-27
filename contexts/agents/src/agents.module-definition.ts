import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { ToolApis } from '@intentra/agent-surface';

export type AgentsModuleOptions = {
  /** 32 bytes, base64: encrypts the OpenRouter keys at rest. */
  readonly secretsKey: string;
  /** The OpenRouter model a new orchestrator starts on. */
  readonly defaultModel: string;
  /**
   * What the tools of the agents read from, on behalf of the person in the
   * chat (ADR-0002).
   */
  readonly toolApis: ToolApis;
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: AGENTS_OPTIONS } =
  new ConfigurableModuleBuilder<AgentsModuleOptions>().build();
