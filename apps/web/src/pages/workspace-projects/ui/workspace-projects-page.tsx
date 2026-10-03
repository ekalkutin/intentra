import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useProjectsQuery } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { CreateProjectDialog } from '@/features/create-project';
import { toApiError } from '@/shared/api';
import { projectPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  List,
  LIST_ROW_LINK_CLASS,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';

/** The Workspace's Projects, each a volume of its own. */
export function WorkspaceProjectsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { workspace, access } = useCurrentWorkspace();
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useProjectsQuery(workspace?.id ?? '', { skip: !workspace });
  const loadError = toApiError(error);

  if (!workspace || !access) {
    return <PageSkeleton />;
  }

  const createButton = access.canCreateProjects && (
    <CreateProjectDialog
      workspace={workspace}
      trigger={
        <Button>
          <Plus />
          {t('shell.createProject')}
        </Button>
      }
    />
  );

  return (
    <Page>
      <PageHeader
        title={t('projects.title')}
        description={t('projects.description')}
        actions={createButton}
      />
      <List>
        {isLoading && <ListSkeleton />}
        {loadError && (
          <ListEmpty>
            <LoadError
              text={describeError(loadError).text}
              onRetry={() => void refetch()}
            />
          </ListEmpty>
        )}
        {projects?.length === 0 && (
          <ListEmpty>
            {access.canCreateProjects
              ? t('projects.empty')
              : t('projects.emptyReadOnly')}
          </ListEmpty>
        )}
        {projects?.map(project => {
          const role = access.projects[project.id]?.role;
          return (
            <ListRow key={project.id} lead={project.slug} interactive>
              <Link
                to={projectPath(workspace.slug, project.slug)}
                className={`block text-sm font-medium ${LIST_ROW_LINK_CLASS}`}
              >
                {project.name}
              </Link>
              {role && (
                <p className='text-xs text-muted-foreground'>
                  {t('projects.yourAccess', {
                    role: t(`projectRoles.${role}`).toLowerCase(),
                  })}
                </p>
              )}
            </ListRow>
          );
        })}
      </List>
    </Page>
  );
}
