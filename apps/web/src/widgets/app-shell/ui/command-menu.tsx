import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { projectPath, workspacePath } from '@/shared/config';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/shared/ui';
import type { ProjectDto, WorkspaceDto } from '@intentra/contracts/workspace';

import { PROJECT_NAVIGATION, WORKSPACE_NAVIGATION } from '../model/navigation';

import { InitialTile } from './initial-tile';

const OPEN_KEY = 'k';

/** ⌘K: jump to a Project, a page, or another Workspace by typing. */
export function CommandMenu({
  open,
  onOpenChange,
  workspace,
  workspaces,
  projects,
  currentProject,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly workspace: WorkspaceDto | undefined;
  readonly workspaces: readonly WorkspaceDto[];
  readonly projects: readonly ProjectDto[];
  readonly currentProject: ProjectDto | undefined;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === OPEN_KEY && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate(to);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('shell.searchTitle')}
      description={t('shell.searchDescription')}
    >
      <Command>
        <CommandInput placeholder={t('shell.searchPlaceholder')} />
        <CommandList className='max-h-[min(60vh,26rem)]'>
          <CommandEmpty>{t('shell.searchEmpty')}</CommandEmpty>
          {workspace && currentProject && (
            <CommandGroup heading={currentProject.name}>
              {PROJECT_NAVIGATION.map(entry => (
                <CommandItem
                  key={entry.labelKey}
                  value={`${currentProject.name} ${t(`shell.projectPages.${entry.labelKey}`)}`}
                  onSelect={() =>
                    go(
                      projectPath(
                        workspace.slug,
                        currentProject.slug,
                        entry.page,
                      ),
                    )
                  }
                >
                  <entry.icon />
                  {t(`shell.projectPages.${entry.labelKey}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {workspace && projects.length > 0 && (
            <CommandGroup heading={t('shell.projects')}>
              {projects.map(project => (
                <CommandItem
                  key={project.id}
                  value={`${project.name} ${project.slug}`}
                  onSelect={() => go(projectPath(workspace.slug, project.slug))}
                >
                  <InitialTile name={project.name} />
                  {project.name}
                  <CommandShortcut className='font-mono'>
                    {project.slug}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {workspace && (
            <CommandGroup heading={workspace.name}>
              {WORKSPACE_NAVIGATION.map(entry => (
                <CommandItem
                  key={entry.labelKey}
                  value={`${workspace.name} ${t(`shell.workspacePages.${entry.labelKey}`)}`}
                  onSelect={() => go(workspacePath(workspace.slug, entry.page))}
                >
                  <entry.icon />
                  {t(`shell.workspacePages.${entry.labelKey}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {workspaces.length > 1 && (
            <CommandGroup heading={t('shell.workspaces')}>
              {workspaces
                .filter(candidate => candidate.id !== workspace?.id)
                .map(candidate => (
                  <CommandItem
                    key={candidate.id}
                    value={`${candidate.name} ${candidate.slug}`}
                    onSelect={() => go(workspacePath(candidate.slug))}
                  >
                    <InitialTile name={candidate.name} />
                    {candidate.name}
                    <CommandShortcut className='font-mono'>
                      {candidate.slug}
                    </CommandShortcut>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
