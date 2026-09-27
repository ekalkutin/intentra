import { Provider } from '@nestjs/common';

import {
  ChangeAccountPasswordCommand,
  ChangeAccountPasswordCommandHandler,
} from './change-account-password/change-account-password.command.js';
import {
  FindManyAccountsQuery,
  FindManyAccountsQueryHandler,
} from './find-many-accounts/find-many-accounts.query.js';
import {
  GetOneAccountQuery,
  GetOneAccountQueryHandler,
} from './get-one-account/get-one-account.query.js';
import {
  UpdateAccountCommand,
  UpdateAccountCommandHandler,
} from './update-account/update-account.command.js';

export {
  ChangeAccountPasswordCommand,
  FindManyAccountsQuery,
  GetOneAccountQuery,
  UpdateAccountCommand,
};

export const ACCOUNTS_CQRS_HANDLERS: Provider[] = [
  GetOneAccountQueryHandler,
  FindManyAccountsQueryHandler,
  UpdateAccountCommandHandler,
  ChangeAccountPasswordCommandHandler,
];
