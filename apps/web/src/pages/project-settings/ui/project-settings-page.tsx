import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  useCurrentProject,
  useDeleteProjectMutation,
} from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { workspacePath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  ConfirmBySlugDialog,
  List,
  ListRow,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';

/** What the Project is, and deleting it for good. */
export function ProjectSettingsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project, access } = useCurrentProject(workspace?.id, workspaceAccess);
  const [deleteProject] = useDeleteProjectMutation();
  const [failure, setFailure] = useState<string | null>(null);

  if (!workspace || !project || !access) {
    return <PageSkeleton />;
  }

  const onDelete = async (slug: string) => {
    const result = await deleteProject({
      workspaceId: workspace.id,
      projectId: project.id,
      body: { slug },
    });
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
    if (!error) {
      void navigate(workspacePath(workspace.slug), { replace: true });
    }
    return !error;
  };

  return (
    <Page>
      <PageHeader title={t('projectSettings.title')} />
      <PageSection
        title={t('projectSettings.about')}
        description={t('projectSettings.aboutDescription')}
      >
        <List>
          <ListRow>
            <p className='text-xs text-muted-foreground'>{t('fields.name')}</p>
            <p className='text-sm font-medium'>{project.name}</p>
          </ListRow>
          <ListRow>
            <p className='text-xs text-muted-foreground'>{t('fields.slug')}</p>
            <p className='font-mono text-sm'>{project.slug}</p>
          </ListRow>
        </List>
      </PageSection>
      <PageSection
        title={t('projectSettings.danger')}
        description={
          access.canDelete
            ? t('projectSettings.deleteDescription')
            : t('projectSettings.deleteForbidden')
        }
      >
        {access.canDelete && (
          <div>
            <ConfirmBySlugDialog
              trigger={
                <Button variant='destructive'>
                  <Trash2 />
                  {t('projectSettings.delete')}
                </Button>
              }
              title={t('projectSettings.delete')}
              description={t('projectSettings.deleteDescription')}
              slug={project.slug}
              confirmLabel={t('projectSettings.delete')}
              error={failure}
              onConfirm={onDelete}
            />
          </div>
        )}
      </PageSection>
    </Page>
  );
}
