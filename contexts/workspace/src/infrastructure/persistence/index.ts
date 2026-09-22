import { Provider } from '@nestjs/common';

import { UnitOfWork } from '@intentra/shared';

import { PrismaUnitOfWork } from './prisma/prisma-unit-of-work.js';
import { PrismaService } from './prisma/prisma.service.js';

export { PrismaService, PrismaUnitOfWork };
export type { PrismaTransaction } from './prisma/prisma.service.js';

export const PERSISTENCE: Provider[] = [
  PrismaService,
  PrismaUnitOfWork,
  /* Один экземпляр под двумя токенами: use-case берёт порт и умеет им только
     `run`, репозиторий берёт привязку к Prisma и достаёт из неё клиента.
     Ячейка асинхронного контекста у них общая — она в экземпляре. */
  { provide: UnitOfWork, useExisting: PrismaUnitOfWork },
];
