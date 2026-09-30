import { Provider } from '@nestjs/common';

import { INVITATION_REPOSITORY_PROVIDER } from './outbound/invitation-repository.adapter.js';
import { MEMBER_REPOSITORY_PROVIDER } from './outbound/member-repository.adapter.js';
import { PERSONAL_ACCESS_TOKEN_REPOSITORY_PROVIDER } from './outbound/personal-access-token-repository.adapter.js';
import { PERSONAL_ACCESS_TOKEN_SECRETS_PROVIDER } from './outbound/personal-access-token-secrets.adapter.js';
import { PROJECT_REPOSITORY_PROVIDER } from './outbound/project-repository.adapter.js';
import { PROJECT_ROLE_ASSIGNMENT_REPOSITORY_PROVIDER } from './outbound/project-role-assignment-repository.adapter.js';
import { WORKSPACE_REPOSITORY_PROVIDER } from './outbound/workspace-repository.adapter.js';

export const ADAPTERS: Provider[] = [
  WORKSPACE_REPOSITORY_PROVIDER,
  MEMBER_REPOSITORY_PROVIDER,
  PROJECT_REPOSITORY_PROVIDER,
  INVITATION_REPOSITORY_PROVIDER,
  PROJECT_ROLE_ASSIGNMENT_REPOSITORY_PROVIDER,
  PERSONAL_ACCESS_TOKEN_REPOSITORY_PROVIDER,
  PERSONAL_ACCESS_TOKEN_SECRETS_PROVIDER,
];
