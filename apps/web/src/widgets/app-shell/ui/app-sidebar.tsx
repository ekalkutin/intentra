import { generatePath, Link, useMatch } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
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
} from '@/shared/ui/sidebar';

import { AI_TEAM_NAV, UTILITY_NAV, WORK_NAV, type NavItem } from '../model/nav';

import { WorkspaceSwitcher } from './workspace-switcher';

const NAV_ITEM_CLASS_NAME =
  'text-muted-foreground hover:not-data-active:bg-sidebar-accent/70 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground';

const NavLinkItem = ({ item }: { item: NavItem }) => {
  const { alias } = useCurrentWorkspace();
  const isActive = useMatch({ path: item.path, end: false }) !== null;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        render={<Link to={generatePath(item.path, { alias })} />}
        className={NAV_ITEM_CLASS_NAME}
      >
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NavGroup = ({
  label,
  items,
}: {
  label: string;
  items: readonly NavItem[];
}) => (
  <SidebarGroup>
    <SidebarGroupLabel>{label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu className='gap-0.5'>
        {items.map(item => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export const AppSidebar = () => (
  <Sidebar variant='inset' collapsible='icon'>
    <SidebarHeader className='py-3'>
      <SidebarMenu>
        <SidebarMenuItem>
          <WorkspaceSwitcher />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <NavGroup label='Work' items={WORK_NAV} />
      <NavGroup label='AI team' items={AI_TEAM_NAV} />
    </SidebarContent>

    <SidebarFooter className='p-2'>
      <SidebarMenu className='gap-0.5'>
        {UTILITY_NAV.map(item => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
);
