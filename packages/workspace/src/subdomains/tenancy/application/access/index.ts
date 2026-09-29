import { Provider } from '@nestjs/common';

import { AccessResolver, type ProjectMembership } from './access-resolver.js';

export { AccessResolver, type ProjectMembership };

export const ACCESS_PROVIDERS: Provider[] = [AccessResolver];
