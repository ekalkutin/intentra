import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import { projectPath, workspacePath } from '@/shared/config';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui';
import type {
  ProjectDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import { PROJECT_NAVIGATION, WORKSPACE_NAVIGATION } from '../model/navigation';

import { ProjectSwitcher } from './project-switcher';

const ITEM_CLASS =
  'text-muted-foreground hover:not-data-active:bg-sidebar-accent/70 data-active:text-sidebar-accent-foreground';

/**
 * The sidebar, top to bottom: the Project switcher, then the
 * selected Project's work and the Workspace's settings, always both.
 */
export function AppSidebar({
  workspace,
  workspaces,
  access,
  projects,
  projectsLoading,
  selected,
}: {
  readonly workspace: WorkspaceDto | undefined;
  readonly workspaces: readonly WorkspaceDto[];
  readonly access: WorkspaceAccessDto | undefined;
  readonly projects: readonly ProjectDto[];
  readonly projectsLoading: boolean;
  readonly selected: ProjectDto | undefined;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const link = (to: string, children: ReactNode) => (
    <SidebarMenuButton
      isActive={pathname === to}
      className={ITEM_CLASS}
      render={<Link to={to} onClick={closeOnMobile} />}
    >
      {children}
    </SidebarMenuButton>
  );

  return (
    <Sidebar variant='inset'>
      <SidebarHeader className='gap-1 pt-2'>
        <SidebarMenu>
          <ProjectSwitcher
            workspace={workspace}
            workspaces={workspaces}
            access={access}
            projects={projects}
            selected={selected}
            loading={projectsLoading}
          />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('shell.work')}</SidebarGroupLabel>
          <SidebarGroupContent>
            {workspace && selected ? (
              <SidebarMenu className='gap-0.5'>
                {PROJECT_NAVIGATION.map(entry => (
                  <SidebarMenuItem key={entry.labelKey}>
                    {link(
                      projectPath(workspace.slug, selected.slug, entry.page),
                      <>
                        <entry.icon />
                        <span>{t(`shell.projectPages.${entry.labelKey}`)}</span>
                      </>,
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              !projectsLoading && (
                <div className='px-2 py-1.5'>
                  <p className='text-xs text-pretty text-muted-foreground'>
                    {t('shell.noProjectsHint')}
                  </p>
                </div>
              )
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        {workspace && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('shell.workspace')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-0.5'>
                {WORKSPACE_NAVIGATION.map(entry => (
                  <SidebarMenuItem key={entry.labelKey}>
                    {link(
                      workspacePath(workspace.slug, entry.page),
                      <>
                        <entry.icon />
                        <span>
                          {t(`shell.workspacePages.${entry.labelKey}`)}
                        </span>
                      </>,
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
