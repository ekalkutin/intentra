import { LogOutIcon } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { useSignOut } from '../model/use-sign-out';

export const SignOutButton = ({ className }: { className?: string }) => {
  const signOut = useSignOut();

  return (
    <Button variant='ghost' size='sm' className={className} onClick={signOut}>
      <LogOutIcon data-icon='inline-start' />
      Log out
    </Button>
  );
};
