import { Target } from 'lucide-react';
import { generatePath, Link } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
import { SidebarTrigger } from '@/shared/ui/sidebar';

import { NavUser } from './nav-user';
import { ProjectSwitcher } from './project-switcher';
import { WorkspaceSwitcher } from './workspace-switcher';

/** Where you are, across the top: the workspace, then the open project. */
export const SiteHeader = () => {
  const { alias } = useCurrentWorkspace();

  return (
    <header className='sticky top-0 z-50 flex h-(--header-height) w-full shrink-0 items-center gap-1 border-b border-surface-border bg-background px-2 sm:px-3'>
      <SidebarTrigger />
      <Link
        to={generatePath(ROUTES.WORKSPACE.ROOT, { alias })}
        aria-label='Intentra'
        className='hidden size-8 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex'
      >
        <Target aria-hidden className='size-5' />
      </Link>
      <nav aria-label='Context' className='flex min-w-0 items-center gap-1'>
        <WorkspaceSwitcher />
        <ProjectSwitcher />
      </nav>
      <div className='ml-auto shrink-0'>
        <NavUser />
      </div>
    </header>
  );
};
