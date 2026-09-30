import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useChangeProjectRoleMutation,
  useCurrentProject,
  useProjectRolesQuery,
} from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Badge,
  List,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared/ui';
import {
  ProjectRoleDtoSchema,
  type MemberProjectRoleDto,
  type ProjectDto,
  type ProjectRoleDto,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

/** What each Member of the Workspace may do in this Project. */
export function ProjectAccessPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project, access } = useCurrentProject(workspace?.id, workspaceAccess);
  const {
    data: roles,
    isLoading,
    error,
    refetch,
  } = useProjectRolesQuery(
    { workspaceId: workspace?.id ?? '', projectId: project?.id ?? '' },
    { skip: !workspace || !project },
  );
  const loadError = toApiError(error);

  if (!workspace || !project || !workspaceAccess || !access) {
    return <PageSkeleton />;
  }

  return (
    <Page>
      <PageHeader
        title={t('projectAccess.title')}
        description={
          access.canChangeProjectRoles
            ? t('projectAccess.description')
            : t('projectAccess.readOnly')
        }
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
        {roles?.map(entry => (
          <RoleRow
            key={entry.memberId}
            workspace={workspace}
            project={project}
            entry={entry}
            isYou={entry.memberId === workspaceAccess.memberId}
            canChange={access.canChangeProjectRoles}
          />
        ))}
      </List>
    </Page>
  );
}

function RoleRow({
  workspace,
  project,
  entry,
  isYou,
  canChange,
}: {
  readonly workspace: WorkspaceDto;
  readonly project: ProjectDto;
  readonly entry: MemberProjectRoleDto;
  readonly isYou: boolean;
  readonly canChange: boolean;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [change, { isLoading }] = useChangeProjectRoleMutation();
  const [failure, setFailure] = useState<string | null>(null);
  const items = ProjectRoleDtoSchema.options.map(role => ({
    value: role,
    label: t(`projectRoles.${role}`),
  }));

  const onChange = async (role: ProjectRoleDto) => {
    const result = await change({
      workspaceId: workspace.id,
      projectId: project.id,
      memberId: entry.memberId,
      body: { role },
    });
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
  };

  return (
    <ListRow
      actions={
        canChange ? (
          <>
            {isLoading && <Spinner className='text-muted-foreground' />}
            <Select
              items={items}
              value={entry.role}
              onValueChange={value => value && void onChange(value)}
            >
              <SelectTrigger
                size='sm'
                className='min-w-36'
                aria-label={t('projectAccess.roleLabel', {
                  email: entry.email,
                })}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <span className='text-sm text-muted-foreground'>
            {t(`projectRoles.${entry.role}`)}
          </span>
        )
      }
    >
      <p className='flex min-w-0 items-center gap-2 text-sm font-medium'>
        <span className='truncate'>{entry.email}</span>
        {isYou && <Badge variant='secondary'>{t('common.you')}</Badge>}
      </p>
      <p className='text-xs text-muted-foreground'>
        {t(`projectRoles.${entry.role}Hint`)}
      </p>
      {failure && (
        <p role='alert' className='text-xs text-destructive'>
          {failure}
        </p>
      )}
    </ListRow>
  );
}
