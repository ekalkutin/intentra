import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useParams } from 'react-router';

import { useCurrentProject } from '@/entities/project';
import { useMeQuery } from '@/entities/session';
import {
  readLastWorkspaceSlug,
  useCurrentWorkspace,
} from '@/entities/workspace';
import { ROUTE_PARAMS, ROUTES, workspacePath } from '@/shared/config';
import { useScrollRestoration } from '@/shared/lib';
import {
  Button,
  Page,
  PageHeader,
  SidebarInset,
  SidebarProvider,
} from '@/shared/ui';

import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { CommandMenu } from './command-menu';

/**
 * The signed-in app: the sidebar on a quiet grey frame, and beside it the
 * work area as a rounded canvas with the search and the account on top.
 * Pages outside any Workspace (the Platform Admin's) keep the sidebar on
 * the Workspace opened last.
 */
export function AppShell() {
  const { t } = useTranslation();
  const params = useParams();
  const [searching, setSearching] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  useScrollRestoration(canvas);
  const { data: me } = useMeQuery();
  const inWorkspace = params[ROUTE_PARAMS.workspaceSlug] !== undefined;
  const current = useCurrentWorkspace(
    inWorkspace ? null : readLastWorkspaceSlug(),
  );
  const currentProject = useCurrentProject(
    current.workspace?.id,
    current.access,
  );
  const inProject = params[ROUTE_PARAMS.projectSlug] !== undefined;
  const project = inProject ? currentProject.project : undefined;

  return (
    <SidebarProvider className='h-svh bg-sidebar'>
      <AppSidebar
        workspace={current.workspace}
        workspaces={current.workspaces}
        access={current.access}
        projects={currentProject.projects}
        projectsLoading={current.isLoading || currentProject.isLoading}
        selected={currentProject.selected}
        workspaceLoading={current.isLoading}
        isPlatformAdmin={me?.isPlatformAdmin ?? false}
      />
      <SidebarInset className='min-w-0 overflow-hidden md:shadow-(--canvas-shadow) md:ring-1 md:ring-border'>
        <AppHeader
          workspaceSlug={current.workspace?.slug}
          onSearch={() => setSearching(true)}
        />
        <div
          ref={canvas}
          className='min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto'
        >
          {inWorkspace && current.isMissing ? (
            <Missing
              title={t('shell.workspaceMissing')}
              hint={t('shell.workspaceMissingHint')}
              action={
                <Button
                  variant='outline'
                  render={<Link to={ROUTES.home} />}
                  nativeButton={false}
                >
                  {t('shell.toWorkspaces')}
                </Button>
              }
            />
          ) : inProject && currentProject.isMissing ? (
            <Missing
              title={t('shell.projectMissing')}
              hint={t('shell.projectMissingHint')}
              action={
                current.workspace && (
                  <Button
                    variant='outline'
                    render={<Link to={workspacePath(current.workspace.slug)} />}
                    nativeButton={false}
                  >
                    {t('shell.workspacePages.projects')}
                  </Button>
                )
              }
            />
          ) : (
            <Outlet />
          )}
        </div>
      </SidebarInset>
      <CommandMenu
        open={searching}
        onOpenChange={setSearching}
        workspace={current.workspace}
        workspaces={current.workspaces}
        projects={currentProject.projects}
        currentProject={project}
        workspaceAccess={current.access}
        projectAccess={project && current.access?.projects[project.id]}
        platform={me?.isPlatformAdmin ?? false}
      />
    </SidebarProvider>
  );
}

function Missing({
  title,
  hint,
  action,
}: {
  readonly title: string;
  readonly hint: string;
  readonly action: ReactNode;
}) {
  return (
    <Page>
      <PageHeader title={title} description={hint} actions={action} />
    </Page>
  );
}
