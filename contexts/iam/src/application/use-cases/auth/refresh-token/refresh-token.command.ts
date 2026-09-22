import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { RefreshTokenDto, TokensDto } from '@intentra/iam-contracts';

import { AccountRepository } from '../../../../domain/repositories/index.js';
import { InvalidRefreshToken } from '../../../exceptions/index.js';
import {
  TokenIssuer,
  type RefreshTokenClaims,
} from '../../../services/token-issuer.service.js';

export class RefreshTokenCommand extends Command<TokensDto> {
  constructor(public readonly payload: RefreshTokenDto) {
    super();
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accounts: AccountRepository,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  /**
   * Предъявленный `RefreshToken` нигде не хранится, поэтому и не гасится:
   * выданная ранее пара доживёт свой срок. Аккаунт всё равно перечитывается —
   * токен на удалённую учётную запись обменять нельзя.
   */
  public async execute(command: RefreshTokenCommand): Promise<TokensDto> {
    const accountId = this.verify(command.payload.refresh_token);

    const account = await this.accounts.getById(accountId).catch(() => null);

    if (!account) {
      throw new InvalidRefreshToken();
    }

    return this.tokenIssuer.sign(account);
  }

  /** Одной подписи недостаточно: `AccessToken` подписан тем же ключом. */
  private verify(refreshToken: string): string {
    let claims: Partial<RefreshTokenClaims>;

    try {
      claims =
        this.jwtService.verify<Partial<RefreshTokenClaims>>(refreshToken);
    } catch {
      throw new InvalidRefreshToken();
    }

    if (claims.typ !== 'refresh' || !claims.sub) {
      throw new InvalidRefreshToken();
    }

    return claims.sub;
  }
}
