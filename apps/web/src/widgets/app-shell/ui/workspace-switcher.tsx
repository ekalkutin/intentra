import { useQuery } from '@apollo/client/react';
import { Check, ChevronDown, LogOut, Plus } from 'lucide-react';
import { generatePath, Link } from 'react-router';

import { ME_QUERY } from '@/entities/account';
import {
  useCurrentWorkspace,
  WorkspaceAvatar,
  WORKSPACES_QUERY,
} from '@/entities/workspace';
import { useSignOut } from '@/features/sign-out';
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
import { SidebarMenuButton } from '@/shared/ui/sidebar';

export const WorkspaceSwitcher = () => {
  const workspace = useCurrentWorkspace();
  const { data: workspacesData } = useQuery(WORKSPACES_QUERY);
  const { data: meData } = useQuery(ME_QUERY);
  const signOut = useSignOut();
  const email = meData?.me.email ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton tooltip={workspace.name}>
            <WorkspaceAvatar name={workspace.name} />
            <span className='flex-1 truncate font-medium'>
              {workspace.name}
            </span>
            <ChevronDown className='size-3 text-muted-foreground' />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent
        className='w-auto min-w-56'
        align='start'
        side='bottom'
        sideOffset={4}
      >
        <div className='flex items-center gap-2.5 px-2 py-1.5'>
          <WorkspaceAvatar name={email || '?'} size='md' />
          <p className='min-w-0 flex-1 truncate text-body leading-tight font-medium'>
            {email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className='text-caption text-muted-foreground'>
            Workspaces
          </DropdownMenuLabel>
          {workspacesData?.workspaces.map(item => (
            <DropdownMenuItem
              key={item.id}
              render={
                <Link
                  to={generatePath(ROUTES.WORKSPACE.ROOT, {
                    alias: item.alias,
                  })}
                />
              }
            >
              <WorkspaceAvatar name={item.name} />
              <span className='flex-1 truncate'>{item.name}</span>
              {item.id === workspace.id ? (
                <Check className='size-3.5 text-primary' />
              ) : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem render={<Link to={ROUTES.NEW_WORKSPACE} />}>
            <Plus className='size-3.5' />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant='destructive' onClick={signOut}>
            <LogOut className='size-3.5' />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
