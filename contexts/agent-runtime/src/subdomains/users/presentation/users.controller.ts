import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { FindUserByEmail } from '../application/find-user-by-email.js';

@Controller('users')
export class UsersController {
  constructor(private readonly findUserByEmail: FindUserByEmail) {}

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.findUserByEmail.execute(email);

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
