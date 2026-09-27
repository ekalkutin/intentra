import { useState } from 'react';

import type { AgentProfile } from '@/entities/agent-profile';
import { useCurrentWorkspace } from '@/entities/workspace';
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

import { useDeleteAgentProfile } from '../model/use-delete-agent-profile';

export const DeleteAgentProfileButton = ({
  profile,
}: {
  profile: AgentProfile;
}) => {
  const workspace = useCurrentWorkspace();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteAgentProfile, loading } = useDeleteAgentProfile(workspace.id);

  const remove = async () => {
    const failure = await deleteAgentProfile(profile.id);
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
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{profile.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The orchestrator stops delegating to this agent right away.
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
            onClick={remove}
          >
            {loading ? <Spinner data-icon='inline-start' /> : null}
            Delete agent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
