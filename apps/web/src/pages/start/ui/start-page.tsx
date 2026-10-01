import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import {
  pendingInvitations,
  useReceivedInvitationsQuery,
} from '@/entities/invitation';
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
import {
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';
import { CoverFrame } from '@/widgets/app-shell';

/**
 * Opens the Workspace the person was in last (or their first one). With none
 * yet: their invitations first, if any; creating a Workspace only when they
 * may (Open Workspace Creation, or a Platform Admin); otherwise how to get in.
 */
export function StartPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { data: workspaces, isLoading, error, refetch } = useWorkspacesQuery();
  const creation = useWorkspaceCreationQuery();
  const received = useReceivedInvitationsQuery();
  const loadError = toApiError(error ?? creation.error);
  const canCreate = creation.data?.canCreate ?? false;
  // An invitation comes first: it is why most people are here.
  const invited = pendingInvitations(received.data ?? []).length > 0;

  if (workspaces && workspaces.length > 0) {
    const last = readLastWorkspaceSlug();
    const target =
      workspaces.find(workspace => workspace.slug === last) ?? workspaces[0];
    if (target) {
      return <Navigate to={workspacePath(target.slug)} replace />;
    }
  }

  return (
    <CoverFrame>
      {isLoading || creation.isLoading || received.isLoading ? (
        <PageSkeleton />
      ) : loadError ? (
        <Page>
          <div>
            <LoadError
              text={describeError(loadError).text}
              onRetry={() => {
                void refetch();
                void creation.refetch();
              }}
            />
          </div>
        </Page>
      ) : (
        <Page className='max-w-2xl'>
          {invited ? (
            <>
              <PageHeader
                title={t('start.invitedTitle')}
                description={t('start.invitedDescription')}
              />
              <ReceivedInvitations emptyText={t('start.noInvitations')} />
              {canCreate && (
                <PageSection title={t('start.orCreate')}>
                  <CreateWorkspaceForm />
                </PageSection>
              )}
            </>
          ) : canCreate ? (
            <>
              <PageHeader
                title={t('start.title')}
                description={t('start.description')}
              />
              <CreateWorkspaceForm />
              <PageSection title={t('start.or')}>
                <ReceivedInvitations emptyText={t('start.noInvitations')} />
              </PageSection>
            </>
          ) : (
            <>
              <PageHeader
                title={t('start.waitTitle')}
                description={t('start.waitDescription')}
              />
              <ReceivedInvitations emptyText={t('start.noInvitations')} />
            </>
          )}
        </Page>
      )}
    </CoverFrame>
  );
}
