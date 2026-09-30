import { Briefcase, Crown, Eye, PenLine, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ProjectRoleDto, RoleDto } from '@intentra/contracts/workspace';

const PROJECT_ROLE = {
  viewer: { label: 'Читатель', icon: Eye },
  contributor: { label: 'Автор', icon: PenLine },
  maintainer: { label: 'Сопровождающий', icon: ShieldCheck },
} as const;

export const PROJECT_ROLE_HINT: Record<ProjectRoleDto, string> = {
  viewer: 'Читает знания',
  contributor: 'Записывает и правит черновики',
  maintainer: 'Также утверждает, отклоняет и выводит из употребления',
};

export function ProjectRoleBadge({ role }: { role: ProjectRoleDto }) {
  const { label, icon: Icon } = PROJECT_ROLE[role];
  return (
    <Badge variant='secondary' className='gap-1'>
      <Icon className='size-3' />
      {label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: RoleDto | null }) {
  if (!role) {
    return <span className='text-sm text-muted-foreground'>Участник</span>;
  }
  const Icon = role === 'owner' ? Crown : Briefcase;
  return (
    <Badge
      variant={role === 'owner' ? 'default' : 'secondary'}
      className='gap-1'
    >
      <Icon className='size-3' />
      {role === 'owner' ? 'Владелец' : 'Менеджер'}
    </Badge>
  );
}
