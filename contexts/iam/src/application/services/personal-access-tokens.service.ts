import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type {
  AccountDto,
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
  PersonalAccessTokensApi,
} from '@intentra/contracts/iam';
import { AccountId, Timestamp } from '@intentra/shared';

import { PersonalAccessTokenId } from '../../domain/value-objects/index.js';
import { AccountNotFoundException } from '../exceptions/index.js';
import { toAccountDto, toPersonalAccessTokenDto } from '../mappers/index.js';
import {
  AccountRepository,
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
} from '../ports/index.js';
import {
  CreatePersonalAccessTokenCommand,
  RevokePersonalAccessTokenCommand,
} from '../use-cases/personal-access-tokens/index.js';

@Injectable()
export class PersonalAccessTokensService implements PersonalAccessTokensApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(PersonalAccessTokenRepository)
    private readonly tokenRepository: PersonalAccessTokenRepository,

    @Inject(PersonalAccessTokenSecrets)
    private readonly secrets: PersonalAccessTokenSecrets,

    @Inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  public create(
    accountId: string,
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto> {
    return this.commandBus.execute(
      new CreatePersonalAccessTokenCommand(new AccountId(accountId), data),
    );
  }

  public async find(accountId: string): Promise<PersonalAccessTokenDto[]> {
    const tokens = await this.tokenRepository.findByAccount(
      new AccountId(accountId),
    );
    return tokens.map(toPersonalAccessTokenDto);
  }

  public revoke(accountId: string, id: string): Promise<void> {
    return this.commandBus.execute(
      new RevokePersonalAccessTokenCommand(
        new AccountId(accountId),
        new PersonalAccessTokenId(id),
      ),
    );
  }

  public async verify(token: string): Promise<AccountDto | null> {
    const found = await this.tokenRepository.findBySecretHash(
      this.secrets.hash(token),
    );
    if (!found?.isActive(Timestamp.now())) {
      return null;
    }

    try {
      return toAccountDto(
        await this.accountRepository.getById(found.accountId),
      );
    } catch (error) {
      // A token of a deleted account is not valid any more.
      if (error instanceof AccountNotFoundException) {
        return null;
      }
      throw error;
    }
  }
}
