import { BookOpenText, MessageSquareText, Settings, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { ErrorAlert } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectRoleBadge } from '@/features/workspace/role-badges';
import { useProject } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';

const TABS = [
  { to: 'knowledge', label: 'Знания', icon: BookOpenText },
  { to: 'assistant', label: 'Ассистент', icon: MessageSquareText },
  { to: 'roles', label: 'Роли', icon: Users },
  { to: 'settings', label: 'Настройки', icon: Settings },
];

export function ProjectLayout() {
  const { project, projectAccess, projectsQuery } = useProject();

  if (projectsQuery.isSuccess && !project) {
    return (
      <div className='mx-auto max-w-xl p-8'>
        <ErrorAlert
          error={{ message: 'Такого проекта нет, или он был удалён.' }}
          title='Проект не найден'
        />
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='border-b bg-background px-4 pt-4 md:px-8'>
        <div className='flex items-center gap-3'>
          <h1 className='truncate text-lg font-semibold tracking-tight'>
            {project?.name ?? <Skeleton className='h-6 w-40' />}
          </h1>
          {projectAccess && <ProjectRoleBadge role={projectAccess.role} />}
        </div>
        <nav className='-mb-px mt-3 flex gap-1 overflow-x-auto'>
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 border-b-2 border-transparent px-3 pb-2.5 pt-1 text-sm text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'border-foreground font-medium text-foreground',
                )
              }
            >
              <Icon className='size-4' />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className='min-h-0 flex-1'>
        <Outlet />
      </div>
    </div>
  );
}
