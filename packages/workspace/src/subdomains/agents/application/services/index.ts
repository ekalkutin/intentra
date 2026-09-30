import { Provider } from '@nestjs/common';

import { ConversationsService } from './conversations.service.js';

export { ConversationsService };

export const APPLICATION_SERVICES: Provider[] = [ConversationsService];
