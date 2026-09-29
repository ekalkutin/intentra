export type RoleDto = 'contributor';

export type MemberDto = {
  readonly id: string;
  readonly email: string;
  readonly role: RoleDto;
  readonly isOwner: boolean;
};
