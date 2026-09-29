import { z } from 'zod';

import { ProjectRoleDtoSchema } from '../project-roles/member-project-role.dto.js';

export const CreatePersonalAccessTokenDtoSchema = z.object({
  name: z.string(),
  level: ProjectRoleDtoSchema,
  /** 30, 90 or 365 days, or null for a token that never expires. */
  lifetimeDays: z
    .union([z.literal(30), z.literal(90), z.literal(365), z.null()])
    .default(90),
});

export type CreatePersonalAccessTokenDto = z.infer<
  typeof CreatePersonalAccessTokenDtoSchema
>;
