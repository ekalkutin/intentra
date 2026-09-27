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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar';

const initial = (name: string) => name.charAt(0).toUpperCase();

/** shadcn `sidebar-07` team switcher, over the account's workspaces. */
export const WorkspaceSwitcher = () => {
  const workspace = useCurrentWorkspace();
  const { data } = useQuery(WORKSPACES_QUERY);
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                className='data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground'
              />
            }
          >
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground'>
              {initial(workspace.name)}
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{workspace.name}</span>
              <span className='truncate text-xs'>/{workspace.alias}</span>
            </div>
            <ChevronsUpDownIcon className='ml-auto' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-fit min-w-56'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
