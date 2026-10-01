import type { ProjectRoleDto } from '../project-roles/member-project-role.dto.js';

export type PersonalAccessTokenDto = {
  readonly id: string;
  readonly name: string;
  /** A piece of the secret to tell tokens apart, such as `intr_…x7Qa`. */
  readonly secretHint: string;
  /** Named like a Project Role; caps what the agent may do in each Project. */
  readonly level: ProjectRoleDto;
  readonly memberId: string;
  readonly memberEmail: string;
  readonly memberName: string;
  /** ISO 8601 */
  readonly createdAt: string;
  /** ISO 8601, or null for a token that never expires. */
  readonly expiresAt: string | null;
  /** ISO 8601, or null until an agent first uses it. */
  readonly lastUsedAt: string | null;
};

export type CreatedPersonalAccessTokenDto = {
  readonly token: PersonalAccessTokenDto;
  /** Shown only once, right after creation. */
  readonly secret: string;
};
