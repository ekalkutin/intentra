import { SetMetadata } from '@nestjs/common';

export const ACCOUNT_SCOPED_KEY = 'iam:account-scoped';

/**
 * Действие принадлежит человеку, а не workspace: список его workspace и
 * создание нового. `WorkspaceGuard` для такого маршрута workspace не называет,
 * а обработчик берёт `@RequestAccount()`, а не `@RequestIdentity()`.
 *
 * Всё, что не помечено, считается адресующим workspace.
 */
export const AccountScoped = () => SetMetadata(ACCOUNT_SCOPED_KEY, true);
