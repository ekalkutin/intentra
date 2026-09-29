import { z } from 'zod';

import { RoleDtoSchema } from './member.dto.js';

export const ChangeRoleDtoSchema = z.object({
  /** Null takes the Member's Role away. */
  role: RoleDtoSchema.nullable(),
});

export type ChangeRoleDto = z.infer<typeof ChangeRoleDtoSchema>;
