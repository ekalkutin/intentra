import { z } from 'zod';

import { ProjectRoleDtoSchema } from './member-project-role.dto.js';

export const ChangeProjectRoleDtoSchema = z.object({
  role: ProjectRoleDtoSchema,
});

export type ChangeProjectRoleDto = z.infer<typeof ChangeProjectRoleDtoSchema>;
