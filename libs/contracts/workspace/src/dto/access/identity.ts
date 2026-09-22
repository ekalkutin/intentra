import { z } from 'zod';

/**
 * Кто спрашивает — до всякого workspace.
 *
 * Такой формы достаточно действиям, принадлежащим самому человеку: список его
 * workspace и создание нового. Всё остальное адресует конкретный workspace.
 */
export const AccountIdentitySchema = z.object({
  accountId: z.uuid(),
  isPlatformAdmin: z.boolean().default(false),
});
export type AccountIdentity = z.infer<typeof AccountIdentitySchema>;

/**
 * Кто спрашивает и в каком workspace.
 *
 * Собирается шлюзом: `accountId` — из токена, `workspaceId` — из адреса запроса.
 * Вердикт о правах здесь не содержится: его выносит Workspace на каждый вызов,
 * поэтому устареть в этой структуре нечему (ADR 0003).
 */
export const IdentitySchema = AccountIdentitySchema.extend({
  workspaceId: z.uuid(),
});
export type Identity = z.infer<typeof IdentitySchema>;
