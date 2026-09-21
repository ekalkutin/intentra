import {
  ChevronDownIcon,
  CircleHelpIcon,
  FileTextIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  PlusIcon,
  Settings2Icon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

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

const navigation = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Evidence', href: '/dashboard/evidence', icon: FileTextIcon },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanbanIcon },
  { label: 'People', href: '/dashboard/people', icon: UsersIcon },
];

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar variant='inset' collapsible='icon'>
      <SidebarHeader className='gap-1.5 px-2 py-2'>
        <div className='flex items-center gap-1 group-data-[collapsible=icon]:justify-center'>
          <SidebarMenu className='min-w-0 flex-1 group-data-[collapsible=icon]:hidden'>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton />}>
                  <span className='flex size-5 shrink-0 items-center justify-center rounded-md bg-brand text-[10px] font-semibold tracking-[-0.06em] text-brand-foreground'>
                    I
                  </span>
                  <span className='min-w-0 flex-1 truncate font-medium'>
                    Intentra
                  </span>
                  <ChevronDownIcon className='text-muted-foreground' />
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
          <SidebarTrigger className='shrink-0' />
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
        <SidebarGroup className='pt-2'>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-0.5'>
              {navigation.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.label}
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
            <SidebarMenuButton tooltip='Ask Intentra'>
              <SparklesIcon />
              <span>Ask Intentra</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Settings'>
              <Settings2Icon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Help center'>
              <CircleHelpIcon />
              <span>Help center</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
