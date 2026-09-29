import { z } from 'zod';

export const CreateInvitationDtoSchema = z.object({
  email: z.string(),
});

export type CreateInvitationDto = z.infer<typeof CreateInvitationDtoSchema>;
