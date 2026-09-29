import { z } from 'zod';

export const ProjectRoleDtoSchema = z.enum([
  'viewer',
  'contributor',
  'maintainer',
]);

export type ProjectRoleDto = z.infer<typeof ProjectRoleDtoSchema>;

/** An Active Member of the Workspace and their Project Role in one Project. */
export type MemberProjectRoleDto = {
  readonly memberId: string;
  readonly email: string;
  readonly role: ProjectRoleDto;
};
