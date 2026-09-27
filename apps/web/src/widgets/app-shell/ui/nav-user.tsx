import { useQuery } from '@apollo/client/react';
import { ChevronsUpDownIcon, LogOutIcon, UserRoundIcon } from 'lucide-react';
import { generatePath, Link } from 'react-router';

import { accountInitial, accountLabel, ME_QUERY } from '@/entities/account';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useSignOut } from '@/features/sign-out';
import { ROUTES } from '@/shared/config';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
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

/** shadcn `sidebar-07` user menu. */
export const NavUser = () => {
  const { data } = useQuery(ME_QUERY);
  const { alias } = useCurrentWorkspace();
  const { isMobile } = useSidebar();
  const signOut = useSignOut();
  const me = data?.me;

  const account = (
    <>
      <Avatar>
        <AvatarFallback>{me ? accountInitial(me) : ''}</AvatarFallback>
      </Avatar>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>
          {me ? accountLabel(me) : ''}
        </span>
        {me?.displayName ? (
          <span className='truncate text-caption text-muted-foreground'>
            {me.email}
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size='lg' className='aria-expanded:bg-muted' />
            }
          >
            {account}
            <ChevronsUpDownIcon className='ml-auto size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-fit'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  {account}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    to={generatePath(ROUTES.WORKSPACE.SETTINGS.PROFILE.ROOT, {
                      alias,
                    })}
                  />
                }
              >
                <UserRoundIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
