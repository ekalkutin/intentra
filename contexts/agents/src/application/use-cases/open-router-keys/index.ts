import { Provider } from '@nestjs/common';

import {
  FindOneOpenRouterKeyQuery,
  FindOneOpenRouterKeyQueryHandler,
} from './find-one-open-router-key/find-one-open-router-key.query.js';
import {
  RemoveOpenRouterKeyCommand,
  RemoveOpenRouterKeyCommandHandler,
} from './remove-open-router-key/remove-open-router-key.command.js';
import {
  SetOpenRouterKeyCommand,
  SetOpenRouterKeyCommandHandler,
} from './set-open-router-key/set-open-router-key.command.js';

export {
  FindOneOpenRouterKeyQuery,
  RemoveOpenRouterKeyCommand,
  SetOpenRouterKeyCommand,
};

export const OPEN_ROUTER_KEYS_CQRS_HANDLERS: Provider[] = [
  SetOpenRouterKeyCommandHandler,
  RemoveOpenRouterKeyCommandHandler,
  FindOneOpenRouterKeyQueryHandler,
];
