import { FindUserByEmail } from './application/find-user-by-email.js';
import { UserRepository } from './domain/user.repository.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { UsersController } from './presentation/users.controller.js';

export const USERS_CONTROLLERS = [UsersController];

export const USERS_PROVIDERS = [
  FindUserByEmail,
  { provide: UserRepository, useClass: PrismaUserRepository },
];
