import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  pendingInvitations,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useReceivedInvitationsQuery,
} from '@/entities/invitation';
import { useLazyWorkspacesQuery } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { workspacePath } from '@/shared/config';
import { useDescribeError, useFormatShortDate } from '@/shared/i18n';
import {
  Button,
  List,
  ListEmpty,
  ListSkeleton,
  LoadError,
  Spinner,
} from '@/shared/ui';
import type { InvitationDto } from '@intentra/contracts/workspace';

/**
 * The invitations the signed-in person has not answered yet. Accepting one
 * opens its Workspace.
 */
export function ReceivedInvitations({
  emptyText,
}: {
  readonly emptyText: string;
}) {
  const describeError = useDescribeError();
  const { data, isLoading, error, refetch } = useReceivedInvitationsQuery();
  const loadError = toApiError(error);
  const invitations = pendingInvitations(data ?? []);

  if (loadError) {
    return (
      <List>
        <ListEmpty>
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => void refetch()}
          />
        </ListEmpty>
      </List>
    );
  }

  return (
    <List>
      {isLoading && <ListSkeleton rows={2} />}
      {!isLoading && invitations.length === 0 && (
        <ListEmpty>{emptyText}</ListEmpty>
      )}
      {invitations.map(invitation => (
        <InvitationRow key={invitation.id} invitation={invitation} />
      ))}
    </List>
  );
}

function InvitationRow({ invitation }: { readonly invitation: InvitationDto }) {
  const { t } = useTranslation();
  const formatDate = useFormatShortDate();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const [accept, { isLoading: accepting }] = useAcceptInvitationMutation();
  const [decline, { isLoading: declining }] = useDeclineInvitationMutation();
  const [loadWorkspaces] = useLazyWorkspacesQuery();
  const [failure, setFailure] = useState<string | null>(null);

  const onAccept = async () => {
    const result = await accept(invitation.id);
    const error = toApiError(result.error);
    if (error) {
      setFailure(describeError(error).text);
      return;
    }
    const workspaces = await loadWorkspaces().unwrap();
    const joined = workspaces.find(
      workspace => workspace.id === invitation.workspaceId,
    );
    if (joined) {
      void navigate(workspacePath(joined.slug));
    }
  };

  const onDecline = async () => {
    const result = await decline(invitation.id);
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
  };

  return (
    <li className='flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3'>
      <span className='flex min-w-0 flex-1 basis-56 items-center gap-3'>
        <span
          aria-hidden
          className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground/80'
        >
          {invitation.workspaceName.trim().charAt(0).toUpperCase()}
        </span>
        <span className='min-w-0'>
          <span className='block truncate text-sm font-medium'>
            {invitation.workspaceName}
          </span>
          <span className='block text-xs text-muted-foreground tabular-nums'>
            {t('receivedInvitations.dates', {
              sent: formatDate(invitation.sentAt),
              expires: formatDate(invitation.expiresAt),
            })}
          </span>
        </span>
      </span>
      {/* Below 640px the buttons go under the name, lined up with it. */}
      <span className='ml-11 flex shrink-0 items-center gap-2 sm:ml-0'>
        <Button
          variant='ghost'
          size='sm'
          disabled={accepting || declining}
          onClick={() => void onDecline()}
        >
          {declining && <Spinner />}
          {t('receivedInvitations.decline')}
        </Button>
        <Button
          size='sm'
          disabled={accepting || declining}
          onClick={() => void onAccept()}
        >
          {accepting && <Spinner />}
          {t('receivedInvitations.accept')}
        </Button>
      </span>
      {failure && (
        <p role='alert' className='w-full pl-11 text-xs text-destructive'>
          {failure}
        </p>
      )}
    </li>
  );
}
