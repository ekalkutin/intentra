import { useQuery } from '@apollo/client/react';
import { LogOutIcon, UserRoundIcon } from 'lucide-react';
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

/** The account menu: an avatar at the right end of the top bar. */
export const NavUser = () => {
  const { data } = useQuery(ME_QUERY);
  const { alias } = useCurrentWorkspace();
  const signOut = useSignOut();
  const me = data?.me;
  const initial = me ? accountInitial(me) : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='Account'
        className='flex size-8 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
      >
        <Avatar className='size-7'>
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-fit min-w-56' align='end'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
              <Avatar>
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 leading-tight'>
                <span className='truncate font-medium'>
                  {me ? accountLabel(me) : ''}
                </span>
                {me?.displayName ? (
                  <span className='truncate text-caption text-muted-foreground'>
                    {me.email}
                  </span>
                ) : null}
              </div>
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
  );
};
