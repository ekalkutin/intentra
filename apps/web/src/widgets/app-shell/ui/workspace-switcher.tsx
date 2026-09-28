import { useQuery } from '@apollo/client/react';
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { generatePath, Link } from 'react-router';

import { useCurrentWorkspace, WORKSPACES_QUERY } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { CONTEXT_SWITCHER_TRIGGER } from './context-switcher-trigger';

const initial = (name: string) => name.charAt(0).toUpperCase();

export const WorkspaceSwitcher = () => {
  const workspace = useCurrentWorkspace();
  const { data } = useQuery(WORKSPACES_QUERY);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={CONTEXT_SWITCHER_TRIGGER}>
        <div className='flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-micro font-semibold text-primary-foreground'>
          {initial(workspace.name)}
        </div>
        <span className='truncate'>{workspace.name}</span>
        <ChevronsUpDownIcon className='size-3.5 shrink-0 text-muted-foreground' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-fit min-w-56' align='start'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='text-xs text-muted-foreground'>
            Workspaces
          </DropdownMenuLabel>
          {data?.workspaces.map(item => (
            <DropdownMenuItem
              key={item.id}
              className='gap-2 p-2'
              render={
                <Link
                  to={generatePath(ROUTES.WORKSPACE.ROOT, {
                    alias: item.alias,
                  })}
                />
              }
            >
              <div className='flex size-6 items-center justify-center rounded-md border'>
                {initial(item.name)}
              </div>
              <span className='flex-1 truncate'>{item.name}</span>
              {item.id === workspace.id ? <CheckIcon /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className='gap-2 p-2'
            render={<Link to={ROUTES.NEW_WORKSPACE} />}
          >
            <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
              <PlusIcon />
            </div>
            <div className='font-medium text-muted-foreground'>
              Create workspace
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
