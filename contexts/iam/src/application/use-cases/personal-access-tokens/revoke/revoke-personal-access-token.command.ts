import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Timestamp, type AccountId } from '@intentra/shared';

import type { PersonalAccessTokenId } from '../../../../domain/value-objects/index.js';
import { PersonalAccessTokenRepository } from '../../../ports/index.js';

export class RevokePersonalAccessTokenCommand extends Command<void> {
  constructor(
    public readonly accountId: AccountId,
    public readonly id: PersonalAccessTokenId,
  ) {
    super();
  }
}

/** Revoking a revoked token again does nothing; a missing one is an error. */
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
    const token = await this.tokenRepository.getById(accountId, id);
    token.revoke(Timestamp.now());
    await this.tokenRepository.save(token);
  }
}
