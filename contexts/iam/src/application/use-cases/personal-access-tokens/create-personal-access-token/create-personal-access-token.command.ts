import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { CreatePersonalAccessTokenDto } from '@intentra/contracts/iam';
import { AccountId, Timestamp } from '@intentra/shared';

import { PersonalAccessToken } from '../../../../domain/entities/index.js';
import { PersonalAccessTokenName } from '../../../../domain/value-objects/index.js';
import {
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
} from '../../../ports/index.js';

export type CreatedPersonalAccessToken = {
  readonly id: string;
  readonly secret: string;
};

export class CreatePersonalAccessTokenCommand extends Command<CreatedPersonalAccessToken> {
  constructor(
    public readonly accountId: string,
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
  }: CreatePersonalAccessTokenCommand): Promise<CreatedPersonalAccessToken> {
    const now = Timestamp.now();
    const secret = this.secrets.generate();

    const token = PersonalAccessToken.issue(
      {
        accountId: new AccountId(accountId),
        name: new PersonalAccessTokenName(payload.name),
        secretHash: this.secrets.hash(secret),
        expiresAt: payload.expiresInDays
          ? now.addDays(payload.expiresInDays)
          : null,
      },
      now,
    );
    await this.tokenRepository.save(token);

    return { id: token.id.value, secret };
  }
}
