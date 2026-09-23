import { Inject, Injectable } from '@nestjs/common';

import { AccountRepository } from './application/ports/account-repository.port.js';

@Injectable()
export class IamService {
  constructor(
    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  async onModuleInit() {
    // Initialization logic here
    console.log('Initializing IamService');
    const accounts = await this.accountRepository.find();
    console.log({ accounts });
  }
}
