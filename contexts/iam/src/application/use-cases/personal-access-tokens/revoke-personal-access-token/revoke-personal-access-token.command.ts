import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AccountId, Timestamp } from '@intentra/shared';

import { PersonalAccessTokenId } from '../../../../domain/value-objects/index.js';
import { PersonalAccessTokenRepository } from '../../../ports/index.js';

export class RevokePersonalAccessTokenCommand extends Command<void> {
  constructor(
    public readonly accountId: string,
    public readonly id: string,
  ) {
    super();
  }
}

@CommandHandler(RevokePersonalAccessTokenCommand)
export class RevokePersonalAccessTokenCommandHandler implements ICommandHandler<RevokePersonalAccessTokenCommand> {
  constructor(
    @Inject(PersonalAccessTokenRepository)
    private readonly tokenRepository: PersonalAccessTokenRepository,
  ) {}

  public async execute({
    accountId,
    id,
  }: RevokePersonalAccessTokenCommand): Promise<void> {
    const token = await this.tokenRepository.getById(
      new AccountId(accountId),
      new PersonalAccessTokenId(id),
    );
    token.revoke(Timestamp.now());
    await this.tokenRepository.save(token);
  }
}
