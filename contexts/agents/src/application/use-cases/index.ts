import { Provider } from '@nestjs/common';

import { AGENT_PROFILES_CQRS_HANDLERS } from './agent-profiles/index.js';
import { AGENT_TOOLS_CQRS_HANDLERS } from './agent-tools/index.js';
import { CHAT_CQRS_HANDLERS } from './chat/index.js';
import { MODELS_CQRS_HANDLERS } from './models/index.js';
import { OPEN_ROUTER_KEYS_CQRS_HANDLERS } from './open-router-keys/index.js';

export const CQRS_HANDLERS: Provider[] = [
  ...AGENT_PROFILES_CQRS_HANDLERS,
  ...OPEN_ROUTER_KEYS_CQRS_HANDLERS,
  ...MODELS_CQRS_HANDLERS,
  ...AGENT_TOOLS_CQRS_HANDLERS,
  ...CHAT_CQRS_HANDLERS,
];
