import { Provider } from '@nestjs/common';

import {
  CreatePersonalAccessTokenCommand,
  CreatePersonalAccessTokenCommandHandler,
} from './create/create-personal-access-token.command.js';
import {
  RevokePersonalAccessTokenCommand,
  RevokePersonalAccessTokenCommandHandler,
} from './revoke/revoke-personal-access-token.command.js';

export { CreatePersonalAccessTokenCommand, RevokePersonalAccessTokenCommand };

export const PERSONAL_ACCESS_TOKENS_CQRS_HANDLERS: Provider[] = [
  CreatePersonalAccessTokenCommandHandler,
  RevokePersonalAccessTokenCommandHandler,
];
