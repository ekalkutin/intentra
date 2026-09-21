import { Injectable } from '@nestjs/common';

import { UserRepository } from '../domain/user.repository.js';

@Injectable()
export class FindUserByEmail {
  constructor(private readonly users: UserRepository) {}

  execute(email: string) {
    return this.users.findByEmail(email);
  }
}
