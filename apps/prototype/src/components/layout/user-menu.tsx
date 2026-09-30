import { LogOut } from 'lucide-react';

import { useMeQuery } from '@/api/iam-api';
import { useAppDispatch } from '@/app/hooks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signedOut } from '@/features/auth/auth-slice';
import { initials } from '@/lib/format';

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { data: me } = useMeQuery();
  const dispatch = useAppDispatch();
  const email = me?.email ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={
            compact ? 'size-8 p-0' : 'h-10 w-full justify-start gap-2 px-2'
          }
        >
          <Avatar className='size-7'>
            <AvatarFallback className='text-xs'>
              {email ? initials(email) : '?'}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <span className='truncate text-sm font-normal'>{email}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='truncate font-normal text-muted-foreground'>
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => dispatch(signedOut())}>
          <LogOut />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
