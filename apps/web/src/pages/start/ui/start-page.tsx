import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import {
  readLastWorkspaceSlug,
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
 * Opens the Workspace the person was in last (or their first one); with none
 * yet, offers to create one or to accept an invitation.
 */
export function StartPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { data: workspaces, isLoading, error, refetch } = useWorkspacesQuery();
  const loadError = toApiError(error);

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
      {isLoading ? (
        <PageSkeleton />
      ) : loadError ? (
        <Page>
          <div>
            <LoadError
              text={describeError(loadError).text}
              onRetry={() => void refetch()}
            />
          </div>
        </Page>
      ) : (
        <Page className='max-w-2xl'>
          <PageHeader
            title={t('start.title')}
            description={t('start.description')}
          />
          <div>
            <div>
              <CreateWorkspaceForm />
            </div>
          </div>
          <PageSection title={t('start.or')}>
            <ReceivedInvitations emptyText={t('start.noInvitations')} />
          </PageSection>
        </Page>
      )}
    </CoverFrame>
  );
}
