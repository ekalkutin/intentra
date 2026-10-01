import { MailOpen, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import {
  pendingInvitations,
  useReceivedInvitationsQuery,
} from '@/entities/invitation';
import { useMeQuery } from '@/entities/session';
import {
  readLastWorkspaceSlug,
  useWorkspaceCreationQuery,
  useWorkspacesQuery,
} from '@/entities/workspace';
import { CreateWorkspaceForm } from '@/features/create-workspace';
import { ReceivedInvitations } from '@/features/respond-to-invitation';
import { toApiError } from '@/shared/api';
import { workspacePath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';
import { CoverFrame } from '@/widgets/app-shell';

/** While nothing waits for them, the page asks for new invitations this often. */
const INVITATION_POLL_MS = 20_000;

/**
 * Opens the Workspace the person was in last (or their first one). With none
 * yet, one of three doorways: their invitations, if any (nothing else: they
 * were asked in); otherwise creating a Workspace, when they may (Open
 * Workspace Creation, or a Platform Admin); otherwise waiting for an
 * invitation, which shows up on its own.
 */
export function StartPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { data: me } = useMeQuery();
  const { data: workspaces, isLoading, error, refetch } = useWorkspacesQuery();
  const creation = useWorkspaceCreationQuery();
  const [polling, setPolling] = useState(true);
  const received = useReceivedInvitationsQuery(undefined, {
    pollingInterval: polling ? INVITATION_POLL_MS : 0,
    skipPollingIfUnfocused: true,
  });
  const invitations = pendingInvitations(received.data ?? []);
  const invited = invitations.length > 0;
  if (polling === invited) {
    // Only the empty doorways listen for invitations; a list on screen is enough.
    setPolling(!invited);
  }
  const loadError = toApiError(error ?? creation.error ?? received.error);
  const canCreate = creation.data?.canCreate ?? false;
  const title = me?.name
    ? t('start.welcome', { name: me.name })
    : t('start.welcomeAnonymous');
  const email = me?.email ?? '';

  if (workspaces && workspaces.length > 0) {
    const last = readLastWorkspaceSlug();
    const target =
      workspaces.find(workspace => workspace.slug === last) ?? workspaces[0];
    if (target) {
      return <Navigate to={workspacePath(target.slug)} replace />;
    }
  }

  if (isLoading || creation.isLoading || received.isLoading) {
    return (
      <CoverFrame>
        <PageSkeleton />
      </CoverFrame>
    );
  }

  return (
    <CoverFrame>
      <Page className='max-w-xl pt-[12vh]'>
        {loadError ? (
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => {
              void refetch();
              void creation.refetch();
              void received.refetch();
            }}
          />
        ) : invited ? (
          <>
            <PageHeader
              title={title}
              description={t('start.invitedDescription', {
                count: invitations.length,
              })}
            />
            <ReceivedInvitations emptyText={t('start.noInvitations')} />
          </>
        ) : canCreate ? (
          <>
            <PageHeader
              title={title}
              description={t('start.createDescription')}
            />
            <CreateWorkspaceForm />
            <p className='text-sm text-pretty text-muted-foreground'>
              <Trans
                i18nKey='start.inviteHint'
                values={{ email }}
                components={{ b: <span className='text-foreground' /> }}
              />
            </p>
          </>
        ) : (
          <>
            <PageHeader title={title} />
            <Empty className='border border-dashed border-border'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <MailOpen />
                </EmptyMedia>
                <EmptyTitle>{t('start.waitTitle')}</EmptyTitle>
                <EmptyDescription>
                  <Trans
                    i18nKey='start.waitDescription'
                    values={{ email }}
                    components={{ b: <span className='text-foreground' /> }}
                  />
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={received.isFetching}
                  onClick={() => void received.refetch()}
                >
                  <RefreshCw
                    className={cn(received.isFetching && 'animate-spin')}
                  />
                  {t('start.check')}
                </Button>
              </EmptyContent>
            </Empty>
          </>
        )}
      </Page>
    </CoverFrame>
  );
}
