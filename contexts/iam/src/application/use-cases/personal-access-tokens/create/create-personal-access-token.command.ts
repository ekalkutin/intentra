import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
} from '@intentra/contracts/iam';
import { Timestamp, type AccountId } from '@intentra/shared';

import { PersonalAccessToken } from '../../../../domain/entities/index.js';
import { PersonalAccessTokenName } from '../../../../domain/value-objects/index.js';
import { toPersonalAccessTokenDto } from '../../../mappers/index.js';
import {
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
} from '../../../ports/index.js';

export class CreatePersonalAccessTokenCommand extends Command<CreatedPersonalAccessTokenDto> {
  constructor(
    public readonly accountId: AccountId,
    public readonly payload: CreatePersonalAccessTokenDto,
  ) {
    super();
  }
}

@CommandHandler(CreatePersonalAccessTokenCommand)
export class CreatePersonalAccessTokenCommandHandler implements ICommandHandler<CreatePersonalAccessTokenCommand> {
  constructor(
    @Inject(PersonalAccessTokenRepository)
    private readonly tokenRepository: PersonalAccessTokenRepository,

    @Inject(PersonalAccessTokenSecrets)
    private readonly secrets: PersonalAccessTokenSecrets,
  ) {}

  public async execute({
    accountId,
    payload,
  }: CreatePersonalAccessTokenCommand): Promise<CreatedPersonalAccessTokenDto> {
    const now = Timestamp.now();
    const secret = this.secrets.generate();

    const token = PersonalAccessToken.issue(
      {
        accountId,
        name: new PersonalAccessTokenName(payload.name),
        secretHash: this.secrets.hash(secret),
        expiresAt: payload.expiresInDays
          ? now.addDays(payload.expiresInDays)
          : null,
      },
      now,
    );
    await this.tokenRepository.save(token);

    return {
      token: secret,
      personalAccessToken: toPersonalAccessTokenDto(token),
    };
  }
}
