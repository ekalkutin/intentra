import { useQuery } from '@apollo/client/react';
import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react';

import { ME_QUERY } from '@/entities/account';
import { useSignOut } from '@/features/sign-out';
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
  const { isMobile } = useSidebar();
  const signOut = useSignOut();
  const email = data?.me.email ?? '';
  const fallback = email.charAt(0).toUpperCase();

  const account = (
    <>
      <Avatar>
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{email}</span>
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
