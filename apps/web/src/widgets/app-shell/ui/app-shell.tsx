import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useParams } from 'react-router';

import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTE_PARAMS, ROUTES, workspacePath } from '@/shared/config';
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
 */
export function AppShell() {
  const { t } = useTranslation();
  const params = useParams();
  const [searching, setSearching] = useState(false);
  const current = useCurrentWorkspace();
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
      />
      <SidebarInset className='min-w-0 overflow-hidden md:shadow-(--canvas-shadow) md:ring-1 md:ring-border'>
        <AppHeader onSearch={() => setSearching(true)} />
        <div className='min-h-0 flex-1 overflow-y-auto'>
          {current.isMissing ? (
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
