import { Provider } from '@nestjs/common';

import {
  StreamChatCommand,
  StreamChatCommandHandler,
} from './stream-chat/stream-chat.command.js';

export { StreamChatCommand };

export const CHAT_CQRS_HANDLERS: Provider[] = [StreamChatCommandHandler];
