import type { Type } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { MeController } from './me.controller.js';

export const IAM_CONTROLLERS: Type[] = [AuthController, MeController];
