import { AccountsController } from './accounts.controller.js';
import { AuthController } from './auth.controller.js';
import { PersonalAccessTokensController } from './personal-access-tokens.controller.js';

export const IAM_CONTROLLERS = [
  AccountsController,
  AuthController,
  PersonalAccessTokensController,
];
