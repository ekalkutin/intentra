import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import { countChanges, useAgentsChangesQuery } from '@/entities/platform-agent';
import {
  PLATFORM_PAGES,
  platformPath,
  projectPath,
  ROUTES,
  workspacePath,
} from '@/shared/config';
import {
  Brand,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui';
import type {
  ProjectDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import {
  PLATFORM_NAVIGATION,
  projectNavigation,
  workspaceNavigation,
} from '../model/navigation';

import { ProjectSwitcher } from './project-switcher';

const ITEM_CLASS =
  'text-muted-foreground hover:not-data-active:bg-sidebar-accent/70 data-active:text-sidebar-accent-foreground';

/**
 * The sidebar, top to bottom: the Project switcher, then the
 * selected Project's work and the Workspace's settings, always both,
 * and for a Platform Admin the platform's pages.
 */
export function AppSidebar({
  workspace,
  workspaces,
  access,
  projects,
  projectsLoading,
  selected,
  workspaceLoading,
  isPlatformAdmin,
}: {
  readonly workspace: WorkspaceDto | undefined;
  readonly workspaces: readonly WorkspaceDto[];
  readonly access: WorkspaceAccessDto | undefined;
  readonly projects: readonly ProjectDto[];
  readonly projectsLoading: boolean;
  readonly selected: ProjectDto | undefined;
  /** The person's Workspaces are still loading. */
  readonly workspaceLoading: boolean;
  readonly isPlatformAdmin: boolean;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: changes } = useAgentsChangesQuery(undefined, {
    skip: !isPlatformAdmin,
  });
  const changed = countChanges(changes);
  // Only outside any Workspace, on the Platform Admin's pages, of someone in none.
  const noWorkspace = !workspace && !workspaceLoading;
  const closeOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  /** A section is active on its own page and, unless it is an index, on the pages under it. */
  const link = (to: string, children: ReactNode, nested = false) => (
    <SidebarMenuButton
      isActive={pathname === to || (nested && pathname.startsWith(`${to}/`))}
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
          {noWorkspace ? (
            <SidebarMenuItem>
              {link(
                ROUTES.home,
                <>
                  <ArrowLeft />
                  <span>{t('shell.toWorkspaces')}</span>
                </>,
              )}
            </SidebarMenuItem>
          ) : (
            <ProjectSwitcher
              workspace={workspace}
              workspaces={workspaces}
              access={access}
              projects={projects}
              selected={selected}
              loading={projectsLoading}
            />
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!noWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('shell.work')}</SidebarGroupLabel>
            <SidebarGroupContent>
              {workspace && selected ? (
                <SidebarMenu className='gap-0.5'>
                  {projectNavigation(access?.projects[selected.id]).map(
                    entry => (
                      <SidebarMenuItem key={entry.labelKey}>
                        {link(
                          projectPath(
                            workspace.slug,
                            selected.slug,
                            entry.page,
                          ),
                          <>
                            <entry.icon />
                            <span>
                              {t(`shell.projectPages.${entry.labelKey}`)}
                            </span>
                          </>,
                          entry.page !== undefined,
                        )}
                      </SidebarMenuItem>
                    ),
                  )}
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
        )}
        {workspace && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('shell.workspace')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-0.5'>
                {workspaceNavigation(access).map(entry => (
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
        {isPlatformAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('platform.title')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-0.5'>
                {PLATFORM_NAVIGATION.map(entry => (
                  <SidebarMenuItem key={entry.labelKey}>
                    {link(
                      platformPath(entry.page),
                      <>
                        <entry.icon />
                        <span>{t(`platform.pages.${entry.labelKey}`)}</span>
                      </>,
                      true,
                    )}
                    {entry.page === PLATFORM_PAGES.changes && changed > 0 && (
                      <SidebarMenuBadge className='font-mono text-muted-foreground tabular-nums'>
                        {changed}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className='pb-3'>
        <Brand className='ml-2 w-32' />
      </SidebarFooter>
    </Sidebar>
  );
}
