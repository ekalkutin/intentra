import { Provider } from '@nestjs/common';

import {
  AccessResolver,
  type ProjectAccess,
  type ProjectMembership,
} from './access-resolver.js';

export { AccessResolver, type ProjectAccess, type ProjectMembership };

export const ACCESS_PROVIDERS: Provider[] = [AccessResolver];
