import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';

import { IamApi } from '@intentra/contracts/iam';

import { ACTOR, type ActorRequest } from './actor-request.js';

const BEARER = /^Bearer\s+(\S+)$/i;

@Injectable()
export class ActorGuard implements CanActivate {
  constructor(@Inject(IamApi) private readonly iam: IamApi) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ActorRequest>();
    const header = request.headers.authorization;
    const token =
      typeof header === 'string' ? BEARER.exec(header)?.[1] : undefined;

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }
    request[ACTOR] = await this.iam.auth.authenticate(token);

    return true;
  }
}
