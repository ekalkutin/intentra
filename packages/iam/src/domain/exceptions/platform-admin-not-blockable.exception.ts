import { ConflictException } from '@intentra/shared-kernel';

export class PlatformAdminNotBlockableException extends ConflictException<'PLATFORM_ADMIN_NOT_BLOCKABLE'> {
  constructor() {
    super('A platform admin cannot be blocked', 'PLATFORM_ADMIN_NOT_BLOCKABLE');
  }
}
