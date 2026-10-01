import type { Actor } from '../auth/actor.js';

import type { AccountDto } from './account.dto.js';
import type { EditMeDto, MeDto } from './me.dto.js';

export abstract class AccountsApi {
  /** The signed-in Account. */
  abstract getMe(actor: Actor): Promise<MeDto>;

  /** The signed-in Account changes its own name. */
  abstract editMe(actor: Actor, data: EditMeDto): Promise<MeDto>;

  /** By email; for a Platform Admin only (403 `NOT_PLATFORM_ADMIN`). */
  abstract list(actor: Actor): Promise<AccountDto[]>;

  /**
   * For a Platform Admin only. It can no longer sign in or refresh its
   * session (403 `ACCOUNT_BLOCKED`); a Platform Admin cannot be blocked
   * (409 `PLATFORM_ADMIN_NOT_BLOCKABLE`).
   */
  abstract block(actor: Actor, accountId: string): Promise<void>;

  /** For a Platform Admin only. */
  abstract unblock(actor: Actor, accountId: string): Promise<void>;
}
