import { Provider } from '@nestjs/common';

import { AccessPolicy } from './access-policy.js';
import { AccessResolver } from './access-resolver.js';

export { AccessPolicy, AccessResolver };
export { ActingMember } from './acting-member.js';

export const ACCESS_PROVIDERS: Provider[] = [AccessResolver, AccessPolicy];
