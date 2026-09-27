import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type { AuthApi, SignUpDto, TokensDto } from '@intentra/contracts/iam';

import { SignUpCommand } from '../use-cases/auth/index.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
  ) {}

  public async signUp(data: SignUpDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignUpCommand(data));
  }
}
