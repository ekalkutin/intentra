import { Provider } from '@nestjs/common';

import {
  FindManyAgentToolsQuery,
  FindManyAgentToolsQueryHandler,
} from './find-many-agent-tools/find-many-agent-tools.query.js';

export { FindManyAgentToolsQuery };

export const AGENT_TOOLS_CQRS_HANDLERS: Provider[] = [
  FindManyAgentToolsQueryHandler,
];
