import { ForbiddenException } from '@intentra/shared-kernel';

export class NotPlatformAdminException extends ForbiddenException<'NOT_PLATFORM_ADMIN'> {
  constructor() {
    super('Only a platform admin can do this', 'NOT_PLATFORM_ADMIN');
  }
}
