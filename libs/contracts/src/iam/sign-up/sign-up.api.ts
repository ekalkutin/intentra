import type { Actor } from '../auth/actor.js';

import type { OpenSignUpDto } from './open-sign-up.dto.js';

/** Whether anyone may create an Account; for a Platform Admin only (403 `NOT_PLATFORM_ADMIN`). Off until turned on. */
export abstract class SignUpApi {
  abstract get(actor: Actor): Promise<OpenSignUpDto>;
  abstract set(actor: Actor, data: OpenSignUpDto): Promise<OpenSignUpDto>;
}
