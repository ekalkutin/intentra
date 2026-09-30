import {
  Check,
  ChevronsUpDown,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  Mail,
  Menu,
  Plus,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';

import { useProjectsQuery, useWorkspacesQuery } from '@/api/workspace-api';
import { ErrorAlert } from '@/components/common';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateProjectDialog } from '@/features/workspace/create-dialogs';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';

import { UserMenu } from './user-menu';

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  onNavigate,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          isActive && 'bg-accent font-medium text-foreground',
        )
      }
    >
      <Icon className='size-4 shrink-0' />
      <span className='truncate'>{label}</span>
    </NavLink>
  );
}

function WorkspaceSwitcher() {
  const { workspace, workspaceId } = useWorkspace();
  const { data: workspaces } = useWorkspacesQuery();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-11 w-full justify-start gap-2 px-2'
        >
          <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground'>
            {workspace?.name.charAt(0).toUpperCase() ?? '·'}
          </div>
          <div className='min-w-0 flex-1 text-left'>
            <div className='truncate text-sm font-semibold'>
              {workspace?.name ?? <Skeleton className='h-4 w-24' />}
            </div>
          </div>
          <ChevronsUpDown className='size-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-60'>
        <DropdownMenuLabel className='text-xs text-muted-foreground'>
          Пространства
        </DropdownMenuLabel>
        {workspaces?.map(w => (
          <DropdownMenuItem key={w.id} onSelect={() => navigate(`/w/${w.id}`)}>
            <span className='truncate'>{w.name}</span>
            {w.id === workspaceId && <Check className='ml-auto' />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/')}>
          <LayoutGrid /> Все пространства
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { workspaceId, access } = useWorkspace();
  const { data: projects, isLoading } = useProjectsQuery({ workspaceId });
  const [creating, setCreating] = useState(false);
  const base = `/w/${workspaceId}`;

  return (
    <div className='flex h-full flex-col'>
      <div className='p-2'>
        <WorkspaceSwitcher />
      </div>
      <ScrollArea className='min-h-0 flex-1'>
        <nav className='space-y-6 px-2 py-2'>
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between px-2 pb-1'>
              <span className='text-xs font-medium text-muted-foreground'>
                Проекты
              </span>
              {access?.canCreateProjects && (
                <Button
                  variant='ghost'
                  size='icon-xs'
                  onClick={() => setCreating(true)}
                  aria-label='Новый проект'
                >
                  <Plus />
                </Button>
              )}
            </div>
            {isLoading && <Skeleton className='mx-2 h-6' />}
            {projects?.map(project => (
              <NavItem
                key={project.id}
                to={`${base}/p/${project.id}`}
                icon={FolderKanban}
                label={project.name}
                onNavigate={onNavigate}
              />
            ))}
            {projects?.length === 0 && (
              <p className='px-2 text-xs text-muted-foreground'>
                Проектов пока нет.
              </p>
            )}
          </div>
          <div className='space-y-0.5'>
            <div className='px-2 pb-1 text-xs font-medium text-muted-foreground'>
              Пространство
            </div>
            <NavItem
              to={`${base}/projects`}
              icon={LayoutGrid}
              label='Все проекты'
              onNavigate={onNavigate}
            />
            <NavItem
              to={`${base}/members`}
              icon={Users}
              label='Участники'
              onNavigate={onNavigate}
            />
            {access?.canManageInvitations && (
              <NavItem
                to={`${base}/invitations`}
                icon={Mail}
                label='Приглашения'
                onNavigate={onNavigate}
              />
            )}
            <NavItem
              to={`${base}/tokens`}
              icon={KeyRound}
              label='Токены доступа'
              onNavigate={onNavigate}
            />
            <NavItem
              to={`${base}/settings`}
              icon={Settings}
              label='Настройки'
              onNavigate={onNavigate}
            />
          </div>
        </nav>
      </ScrollArea>
      <div className='flex items-center gap-1 border-t p-2'>
        <div className='min-w-0 flex-1'>
          <UserMenu />
        </div>
        <ThemeToggle />
      </div>
      <CreateProjectDialog
        workspaceId={workspaceId}
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}

export function WorkspaceLayout() {
  const { accessQuery, workspace } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className='flex h-svh overflow-hidden'>
      <aside className='hidden w-64 shrink-0 border-r bg-sidebar md:block'>
        <SidebarContent />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side='left' className='w-72 p-0'>
          <SheetTitle className='sr-only'>Навигация</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex h-12 items-center gap-2 border-b px-3 md:hidden'>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => setMobileOpen(true)}
            aria-label='Открыть навигацию'
          >
            <Menu />
          </Button>
          <span className='truncate font-medium'>{workspace?.name}</span>
          <ThemeToggle className='ml-auto' />
        </div>
        <main className='min-h-0 flex-1 overflow-y-auto'>
          {accessQuery.error ? (
            <div className='mx-auto max-w-xl p-8'>
              <ErrorAlert
                error={accessQuery.error}
                title='Это пространство недоступно'
              />
              <Button asChild variant='link' className='mt-2 px-0'>
                <Link to='/'>К вашим пространствам</Link>
              </Button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
