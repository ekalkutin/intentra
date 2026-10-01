import { z } from 'zod';

export const RoleDtoSchema = z.enum(['owner', 'manager']);

export type RoleDto = z.infer<typeof RoleDtoSchema>;

export type MemberDto = {
  readonly id: string;
  readonly email: string;
  /** Its Account's current name. */
  readonly name: string;
  /** Null for a Member without a Role. */
  readonly role: RoleDto | null;
};
