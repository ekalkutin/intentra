import { ChevronsUpDownIcon, FolderKanban } from 'lucide-react';
import { useState } from 'react';
import {
  generatePath,
  matchPath,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router';

import { useWorkspaceProjects } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

import { PROJECT_NAV } from '../model/nav';

import { CONTEXT_SWITCHER_TRIGGER } from './context-switcher-trigger';

/** cmdk needs a value on every item; this one never collides with a project id. */
const ALL_PROJECTS_VALUE = 'all-projects';

/**
 * The open project in the top bar: a searchable list that keeps the open
 * section when switching. The bar sits above the project route, so the
 * project comes from the URL; outside a project it renders nothing.
 */
export const ProjectSwitcher = () => {
  const [open, setOpen] = useState(false);
  const workspace = useCurrentWorkspace();
  const { projects } = useWorkspaceProjects(workspace.id);
  const match = useMatch({ path: ROUTES.WORKSPACE.PROJECT.ROOT, end: false });
  const project = projects.find(item => item.id === match?.params.projectId);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const section =
    PROJECT_NAV.find(item =>
      matchPath({ path: item.path, end: false }, pathname),
    )?.path ?? ROUTES.WORKSPACE.PROJECT.CHAT;

  if (!project) return null;

  const go = (path: string) => {
    setOpen(false);
    void navigate(path);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span aria-hidden className='text-muted-foreground'>
        /
      </span>
      <PopoverTrigger className={CONTEXT_SWITCHER_TRIGGER}>
        <span className='truncate'>{project.name}</span>
        <ChevronsUpDownIcon className='size-3.5 shrink-0 text-muted-foreground' />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-64 p-0'>
        <Command>
          <CommandInput placeholder='Find a project…' />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup heading='Projects'>
              {projects.map(item => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  keywords={[item.name]}
                  data-checked={item.id === project.id}
                  onSelect={() =>
                    go(
                      generatePath(section, {
                        alias: workspace.alias,
                        projectId: item.id,
                      }),
                    )
                  }
                >
                  <span className='truncate'>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value={ALL_PROJECTS_VALUE}
                onSelect={() =>
                  go(
                    generatePath(ROUTES.WORKSPACE.PROJECTS, {
                      alias: workspace.alias,
                    }),
                  )
                }
              >
                <FolderKanban />
                All projects
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
