import { Provider } from '@nestjs/common';

import { IamApi } from '@intentra/contracts/iam';

import { IamApiService } from './inbound/iam-api.service.js';
import { PlatformAdminBootstrap } from './inbound/platform-admin.bootstrap.js';
import { ACCOUNT_REPOSITORY_PROVIDER } from './outbound/account-repository.adapter.js';
import { PASSWORD_HASHER_PROVIDER } from './outbound/password-hasher.adapter.js';
import { SIGN_UP_SETTINGS_REPOSITORY_PROVIDER } from './outbound/sign-up-settings-repository.adapter.js';
import { TOKEN_SIGNER_PROVIDER } from './outbound/token-signer.adapter.js';

export const ADAPTERS: Provider[] = [
  IamApiService,
  { provide: IamApi, useExisting: IamApiService },
  ACCOUNT_REPOSITORY_PROVIDER,
  PASSWORD_HASHER_PROVIDER,
  TOKEN_SIGNER_PROVIDER,
  SIGN_UP_SETTINGS_REPOSITORY_PROVIDER,
  PlatformAdminBootstrap,
];
