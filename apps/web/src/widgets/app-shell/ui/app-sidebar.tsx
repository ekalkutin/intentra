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

import {
  AI_TEAM_NAV,
  SETTINGS_NAV,
  WORK_NAV,
  type NavItem,
} from '../model/nav';

import { NavUser } from './nav-user';
import { WorkspaceSwitcher } from './workspace-switcher';

const NavLinkItem = ({ item }: { item: NavItem }) => {
  const { alias } = useCurrentWorkspace();
  const isActive = useMatch({ path: item.path, end: false }) !== null;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        isActive={isActive}
        render={<Link to={generatePath(item.path, { alias })} />}
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
    {/* Collapsed, the label fades and slides up over the previous group's
        items; without this it swallows their clicks. */}
    <SidebarGroupLabel className='group-data-[collapsible=icon]:pointer-events-none'>
      {label}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map(item => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

/** Laid out after shadcn's `sidebar-07` block: collapses to icons. */
export const AppSidebar = () => (
  <Sidebar collapsible='icon'>
    <SidebarHeader>
      <WorkspaceSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavGroup label='Work' items={WORK_NAV} />
      <NavGroup label='AI team' items={AI_TEAM_NAV} />
      <NavGroup label='Settings' items={SETTINGS_NAV} />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
);
