import { useState } from 'react';

import type { PersonalAccessToken } from '@/entities/personal-access-token';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import { useRevokePersonalAccessToken } from '../model/use-revoke-personal-access-token';

export const RevokePersonalAccessTokenButton = ({
  token,
}: {
  token: PersonalAccessToken;
}) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { revokeToken, loading } = useRevokePersonalAccessToken();

  const revoke = async () => {
    const failure = await revokeToken(token.id);
    if (failure) {
      setError(failure);
      return;
    }
    setOpen(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        setError(null);
      }}
    >
      <AlertDialogTrigger render={<Button variant='ghost' size='sm' />}>
        Revoke
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke “{token.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Agents using this token lose access right away. This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role='alert' className='text-caption text-destructive'>
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            disabled={loading}
            onClick={revoke}
          >
            {loading ? <Spinner data-icon='inline-start' /> : null}
            Revoke token
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
