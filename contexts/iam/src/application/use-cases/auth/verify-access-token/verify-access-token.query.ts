import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import {
  AccessTokenPayload,
  AccessTokenPayloadSchema,
  VerifyAccessTokenDto,
} from '@intentra/iam-contracts';

export class VerifyAccessTokenQuery extends Query<AccessTokenPayload | null> {
  constructor(public readonly dto: VerifyAccessTokenDto) {
    super();
  }
}

@QueryHandler(VerifyAccessTokenQuery)
export class VerifyAccessTokenQueryHandler implements IQueryHandler<VerifyAccessTokenQuery> {
  constructor(private readonly jwtService: JwtService) {}

  /** Отвечает `null`, а не бросает: негодный токен — обычный ответ, а не сбой. */
  public async execute(
    query: VerifyAccessTokenQuery,
  ): Promise<AccessTokenPayload | null> {
    try {
      const claims = this.jwtService.verify<object>(query.dto.token);

      // `RefreshToken` подписан тем же ключом и несёт только `sub`, поэтому
      // годная подпись сама по себе ещё не делает токен пропуском.
      const parsed = AccessTokenPayloadSchema.safeParse(claims);

      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }
}
