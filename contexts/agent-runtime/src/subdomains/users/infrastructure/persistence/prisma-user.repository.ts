import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/persistence/index.js';
import { UserRepository } from '../../domain/user.repository.js';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly database: PrismaService) {
    super();
  }

  async findByEmail(email: string) {
    const user = await this.database.user.findUnique({ where: { email } });

    return user === null
      ? null
      : {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        };
  }
}
