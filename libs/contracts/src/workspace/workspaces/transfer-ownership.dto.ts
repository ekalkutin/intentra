import { z } from 'zod';

export const TransferOwnershipDtoSchema = z.object({
  memberId: z.string(),
});

export type TransferOwnershipDto = z.infer<typeof TransferOwnershipDtoSchema>;
