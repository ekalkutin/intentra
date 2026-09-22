import { Provider } from '@nestjs/common';

import { AccountRepository } from '../../domain/repositories/index.js';

import { AccountRepositoryAdapter } from './account-repository.adapter.js';
import { PrismaService } from './prisma/prisma.service.js';

export { PrismaService };
export type { PrismaTransaction } from './prisma/prisma.service.js';

export const PERSISTENCE: Provider[] = [
  PrismaService,
  { provide: AccountRepository, useClass: AccountRepositoryAdapter },
];
