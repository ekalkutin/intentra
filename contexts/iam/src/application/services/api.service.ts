import { Injectable } from '@nestjs/common';

import { IamApiPort } from '../ports/index.js';

import { AuthService } from './auth.service.js';

@Injectable()
export class IamApiService implements IamApiPort {
  constructor(public readonly auth: AuthService) {}
}
