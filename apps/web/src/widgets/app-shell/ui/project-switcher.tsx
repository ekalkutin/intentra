import { Check, Plus, Triangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useWorkspaceCreationQuery } from '@/entities/workspace';
import { CreateProjectDialog } from '@/features/create-project';
import { CreateWorkspaceDialog } from '@/features/create-workspace';
import { projectPath, workspacePath } from '@/shared/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/shared/ui';
import type {
  ProjectDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import { InitialTile } from './initial-tile';

/**
 * The Project the sidebar works in, and the way to another one; switching
 * the Workspace, less frequent, sits one level deeper in the same menu.
 */
export function ProjectSwitcher({
  workspace,
  workspaces,
  access,
  projects,
  selected,
  loading,
}: {
  readonly workspace: WorkspaceDto | undefined;
  readonly workspaces: readonly WorkspaceDto[];
  readonly access: WorkspaceAccessDto | undefined;
  readonly projects: readonly ProjectDto[];
  readonly selected: ProjectDto | undefined;
  readonly loading: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const { data: creation } = useWorkspaceCreationQuery();

  if (!workspace || loading) {
    return (
      <SidebarMenuItem>
        <SidebarMenuSkeleton showIcon />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size='lg'
              className='data-popup-open:bg-sidebar-accent'
            />
          }
        >
          <InitialTile name={selected?.name ?? workspace.name} size='lg' />
          <span className='grid min-w-0 flex-1 text-left leading-tight'>
            <span className='truncate font-semibold text-sidebar-accent-foreground'>
              {selected?.name ?? workspace.name}
            </span>
            {selected && (
              <span className='truncate text-xs text-muted-foreground'>
                {workspace.name}
              </span>
            )}
          </span>
          <Triangle
            aria-hidden
            className='size-2! shrink-0 rotate-180 fill-current text-muted-foreground'
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='min-w-60'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t('shell.projects')}</DropdownMenuLabel>
            {projects.map(project => (
              <DropdownMenuItem
                key={project.id}
                onClick={() =>
                  void navigate(projectPath(workspace.slug, project.slug))
                }
              >
                <InitialTile name={project.name} />
                <span className='min-w-0 flex-1 truncate'>{project.name}</span>
                {project.id === selected?.id && <Check />}
              </DropdownMenuItem>
            ))}
            {access?.canCreateProjects && (
              <DropdownMenuItem onClick={() => setCreatingProject(true)}>
                <Plus />
                {t('shell.createProject')}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <InitialTile name={workspace.name} />
              <span className='min-w-0 flex-1 truncate'>{workspace.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='min-w-60'>
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t('shell.workspaces')}</DropdownMenuLabel>
                {workspaces.map(candidate => (
                  <DropdownMenuItem
                    key={candidate.id}
                    onClick={() => void navigate(workspacePath(candidate.slug))}
                  >
                    <InitialTile name={candidate.name} />
                    <span className='min-w-0 flex-1 truncate'>
                      {candidate.name}
                    </span>
                    {candidate.id === workspace.id && <Check />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {creation?.canCreate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCreatingWorkspace(true)}>
                    <Plus />
                    {t('shell.createWorkspace')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProjectDialog
        workspace={workspace}
        open={creatingProject}
        onOpenChange={setCreatingProject}
      />
      <CreateWorkspaceDialog
        open={creatingWorkspace}
        onOpenChange={setCreatingWorkspace}
      />
    </SidebarMenuItem>
  );
}
