import { Provider } from '@nestjs/common';

import { AGENT_PROFILES_CQRS_HANDLERS } from './agent-profiles/index.js';

export const CQRS_HANDLERS: Provider[] = [...AGENT_PROFILES_CQRS_HANDLERS];
