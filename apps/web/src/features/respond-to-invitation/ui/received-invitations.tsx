import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
import { useDescribeError, useFormatDate } from '@/shared/i18n';
import {
  Button,
  List,
  ListEmpty,
  ListRow,
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
  const formatDate = useFormatDate();
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
    <ListRow
      lead={formatDate(invitation.sentAt)}
      actions={
        <>
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
        </>
      }
    >
      <p className='truncate text-sm font-medium'>{invitation.workspaceName}</p>
      <p className='text-xs text-muted-foreground'>
        <Trans
          i18nKey='receivedInvitations.expires'
          values={{ date: formatDate(invitation.expiresAt) }}
          components={{ mono: <span className='font-mono' /> }}
        />
      </p>
      {failure && (
        <p role='alert' className='mt-1 text-xs text-destructive'>
          {failure}
        </p>
      )}
    </ListRow>
  );
}
