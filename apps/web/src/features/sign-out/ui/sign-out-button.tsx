import { LogOut } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

import { useSignOut } from '../model/use-sign-out';

export const SignOutButton = ({ className }: { className?: string }) => {
  const signOut = useSignOut();

  return (
    <Button
      variant='ghost'
      size='sm'
      className={cn('text-muted-foreground hover:text-foreground', className)}
      onClick={signOut}
    >
      <LogOut />
      Log out
    </Button>
  );
};
