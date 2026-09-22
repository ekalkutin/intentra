import {
  BookOpenIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  CircleHelpIcon,
  FileTextIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  PlusIcon,
  Settings2Icon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { useMeQuery } from '@/entities/session';
import { useDict } from '@/features/language-switch';
import { useSignOut } from '@/features/sign-out';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/shared/ui/primitives/sidebar';

const workspaceNavigation = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Evidence', href: '/dashboard/evidence', icon: FileTextIcon },
  { label: 'People', href: '/dashboard/people', icon: UsersIcon },
  { label: 'Chat', href: '/dashboard/chat', icon: MessageSquareIcon },
];

const workNavigation = [
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanbanIcon },
];

const aiNavigation = [
  { label: 'Agents', href: '/dashboard/agents', icon: BotIcon },
  { label: 'Skills', href: '/dashboard/skills', icon: BookOpenIcon },
];

// Mirrors Multica's navigation treatment: quiet at rest, a softer hover, and
// a deliberately stronger selected state. The shared SidebarMenuButton stays
// unmodified so shadcn updates remain safe.
const navItemClassName =
  'text-muted-foreground hover:not-data-active:bg-sidebar-accent/70 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground';

/**
 * Кто вошёл и как выйти.
 *
 * Адрес читается запросом `me`, а не разбором токена в браузере: claims — дело
 * того, кто их подписал, и сервер уже их проверил, пуская этот запрос.
 */
function AccountMenu() {
  const t = useDict();
  const signOut = useSignOut();
  const { data: account } = useMeQuery();

  return (
    <SidebarMenu className='group-data-[collapsible=icon]:hidden'>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton />}>
            <span className='inline-flex size-5 shrink-0 items-center justify-center rounded-full border bg-muted text-caption font-semibold text-muted-foreground uppercase'>
              {account?.email.slice(0, 1) ?? '·'}
            </span>
            <span className='min-w-0 flex-1 truncate text-muted-foreground'>
              {account?.email ?? '…'}
            </span>
            <ChevronsUpDownIcon className='size-3 text-muted-foreground' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='start' side='top'>
            <DropdownMenuGroup>
              <DropdownMenuLabel className='truncate font-normal'>
                {account?.email ?? '…'}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={signOut}>
                <LogOutIcon />
                <span>{t.auth.signOut}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar variant='inset' collapsible='icon'>
      <SidebarHeader className='gap-2 py-3'>
        <div className='flex items-center gap-1 group-data-[collapsible=icon]:justify-center'>
          <SidebarMenu className='min-w-0 flex-1 group-data-[collapsible=icon]:hidden'>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton />}>
                  <span className='inline-flex size-5 shrink-0 items-center justify-center rounded-full border bg-muted text-caption font-semibold text-muted-foreground'>
                    I
                  </span>
                  <span className='min-w-0 flex-1 truncate font-medium'>
                    Intentra
                  </span>
                  <ChevronDownIcon className='size-3 text-muted-foreground' />
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='start'>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                    <DropdownMenuItem>Intentra workspace</DropdownMenuItem>
                    <DropdownMenuItem>Create workspace</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger size='icon' className='shrink-0' />
        </div>
        <SidebarMenu className='gap-0.5 group-data-[collapsible=icon]:hidden'>
          <SidebarMenuItem>
            <SidebarMenuButton className='text-muted-foreground'>
              <PlusIcon />
              <span>New evidence</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-0.5'>
              {workspaceNavigation.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={navItemClassName}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Work</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-0.5'>
              {workNavigation.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={navItemClassName}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-0.5'>
              {aiNavigation.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={navItemClassName}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-2'>
        <SidebarMenu className='gap-0.5'>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Ask Intentra'
              className={navItemClassName}
            >
              <SparklesIcon />
              <span>Ask Intentra</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Settings' className={navItemClassName}>
              <Settings2Icon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Help center'
              className={navItemClassName}
            >
              <CircleHelpIcon />
              <span>Help center</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <AccountMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
