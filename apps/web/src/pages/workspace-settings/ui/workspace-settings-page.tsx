import { LogOut, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useLeaveWorkspaceMutation } from '@/entities/member';
import {
  forgetLastWorkspaceSlug,
  useCurrentWorkspace,
  useDeleteWorkspaceMutation,
} from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { ROUTES } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  ConfirmBySlugDialog,
  ConfirmDialog,
  List,
  ListRow,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';

import { ProviderKeySection } from './provider-key-section';

/** What the Workspace is, leaving it, and deleting it for good. */
export function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const { workspace, access } = useCurrentWorkspace();
  const [leave] = useLeaveWorkspaceMutation();
  const [deleteWorkspace] = useDeleteWorkspaceMutation();
  const [leaveFailure, setLeaveFailure] = useState<string | null>(null);
  const [deleteFailure, setDeleteFailure] = useState<string | null>(null);

  if (!workspace || !access) {
    return <PageSkeleton />;
  }

  const onLeave = async () => {
    const result = await leave(workspace.id);
    const error = toApiError(result.error);
    setLeaveFailure(error ? describeError(error).text : null);
    if (!error) {
      forgetLastWorkspaceSlug();
      void navigate(ROUTES.home, { replace: true });
    }
    return !error;
  };

  const onDelete = async (slug: string) => {
    const result = await deleteWorkspace({
      workspaceId: workspace.id,
      body: { slug },
    });
    const error = toApiError(result.error);
    setDeleteFailure(error ? describeError(error).text : null);
    if (!error) {
      forgetLastWorkspaceSlug();
      void navigate(ROUTES.home, { replace: true });
    }
    return !error;
  };

  return (
    <Page>
      <PageHeader title={t('workspaceSettings.title')} />
      <PageSection
        title={t('workspaceSettings.about')}
        description={t('workspaceSettings.aboutDescription')}
      >
        <List>
          <ListRow>
            <p className='text-xs text-muted-foreground'>{t('fields.name')}</p>
            <p className='text-sm font-medium'>{workspace.name}</p>
          </ListRow>
          <ListRow>
            <p className='text-xs text-muted-foreground'>{t('fields.slug')}</p>
            <p className='font-mono text-sm'>{workspace.slug}</p>
          </ListRow>
        </List>
      </PageSection>
      <ProviderKeySection workspace={workspace} access={access} />
      <PageSection
        title={t('workspaceSettings.leave')}
        description={t('workspaceSettings.leaveDescription')}
      >
        <div>
          <ConfirmDialog
            trigger={
              <Button variant='outline'>
                <LogOut />
                {t('workspaceSettings.leave')}
              </Button>
            }
            title={t('workspaceSettings.leaveConfirmTitle', {
              name: workspace.name,
            })}
            description={t('workspaceSettings.leaveDescription')}
            confirmLabel={t('workspaceSettings.leaveConfirm')}
            error={leaveFailure}
            onConfirm={onLeave}
          />
        </div>
      </PageSection>
      {access.canDeleteWorkspace && (
        <PageSection
          title={t('workspaceSettings.danger')}
          description={t('workspaceSettings.deleteDescription')}
        >
          <div>
            <ConfirmBySlugDialog
              trigger={
                <Button variant='destructive'>
                  <Trash2 />
                  {t('workspaceSettings.delete')}
                </Button>
              }
              title={t('workspaceSettings.delete')}
              description={t('workspaceSettings.deleteDescription')}
              slug={workspace.slug}
              confirmLabel={t('workspaceSettings.delete')}
              error={deleteFailure}
              onConfirm={onDelete}
            />
          </div>
        </PageSection>
      )}
    </Page>
  );
}
