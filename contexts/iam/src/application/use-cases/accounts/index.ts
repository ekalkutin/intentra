import { Provider } from '@nestjs/common';

import {
  GetOneAccountQuery,
  GetOneAccountQueryHandler,
} from './get-one-account/get-one-account.query.js';

export { GetOneAccountQuery };

export const ACCOUNTS_CQRS_HANDLERS: Provider[] = [GetOneAccountQueryHandler];
