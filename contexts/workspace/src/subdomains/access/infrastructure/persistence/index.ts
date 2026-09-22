import { Provider } from '@nestjs/common';

import {
  MembershipRepository,
  RoleAssignmentRepository,
} from '../../domain/repositories/index.js';

import { MembershipRepositoryAdapter } from './membership-repository.adapter.js';
import { RoleAssignmentRepositoryAdapter } from './role-assignment-repository.adapter.js';

export const ACCESS_PERSISTENCE: Provider[] = [
  { provide: MembershipRepository, useClass: MembershipRepositoryAdapter },
  {
    provide: RoleAssignmentRepository,
    useClass: RoleAssignmentRepositoryAdapter,
  },
];
