import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { generatePath, Link, useMatch } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar';

import {
  PROJECT_NAV,
  SETTINGS_NAV,
  WORKSPACE_NAV,
  type NavItem,
} from '../model/nav';

type RouteParams = Record<string, string>;

const NavLinkItem = ({
  item,
  params,
}: {
  item: NavItem;
  /** Fill the item's path: the workspace alias, and the project id inside one. */
  params: RouteParams;
}) => {
  const isActive = useMatch({ path: item.path, end: false }) !== null;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        isActive={isActive}
        render={<Link to={generatePath(item.path, params)} />}
      >
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NavGroup = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => (
  <SidebarGroup>
    {label ? (
      // Collapsed, the label fades and slides up over the previous group's
      // items; without this it swallows their clicks.
      <SidebarGroupLabel className='group-data-[collapsible=icon]:pointer-events-none'>
        {label}
      </SidebarGroupLabel>
    ) : null}
    <SidebarGroupContent>
      <SidebarMenu>{children}</SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

const NavItems = ({
  items,
  params,
}: {
  items: readonly NavItem[];
  params: RouteParams;
}) =>
  items.map(item => (
    <NavLinkItem key={item.path} item={item} params={params} />
  ));

const WorkspaceMenu = ({ alias }: { alias: string }) => (
  <>
    <NavGroup>
      <NavItems items={WORKSPACE_NAV} params={{ alias }} />
    </NavGroup>
    <NavGroup label='Settings'>
      <NavItems items={SETTINGS_NAV} params={{ alias }} />
    </NavGroup>
  </>
);

/** The open project's sections, with a way back to the project list. */
const ProjectMenu = ({
  alias,
  projectId,
}: {
  alias: string;
  projectId: string;
}) => (
  <NavGroup>
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip='All projects'
        className='text-muted-foreground'
        render={
          <Link to={generatePath(ROUTES.WORKSPACE.PROJECTS, { alias })} />
        }
      >
        <ArrowLeft />
        <span>All projects</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <NavItems items={PROJECT_NAV} params={{ alias, projectId }} />
  </NavGroup>
);

/**
 * Under the top bar; collapses to icons. Inside a project it shows only the
 * project's sections: the top bar already names the workspace and project.
 */
export const AppSidebar = () => {
  const { alias } = useCurrentWorkspace();
  const projectId = useMatch({
    path: ROUTES.WORKSPACE.PROJECT.ROOT,
    end: false,
  })?.params.projectId;

  return (
    <Sidebar
      collapsible='icon'
      className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'
    >
      <SidebarContent>
        {projectId ? (
          <ProjectMenu alias={alias} projectId={projectId} />
        ) : (
          <WorkspaceMenu alias={alias} />
        )}
      </SidebarContent>
    </Sidebar>
  );
};
