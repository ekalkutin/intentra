import { Provider } from '@nestjs/common';

import { AccessResolver } from './access-resolver.js';

export { AccessResolver };

export const ACCESS_PROVIDERS: Provider[] = [AccessResolver];
