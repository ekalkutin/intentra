import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  mcpUrl,
  PersonalAccessTokenRow,
  useOwnPersonalAccessTokensQuery,
} from '@/entities/personal-access-token';
import { useMeQuery } from '@/entities/session';
import { useWorkspacesQuery } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  CopyButton,
  List,
  ListEmpty,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
  Separator,
} from '@/shared/ui';

import { CreateTokenDialog } from './create-token-dialog';
import { NameForm } from './name-form';

/**
 * The signed-in person's own settings: their name, and their Personal Access
 * Tokens in every Workspace of theirs, each with the Workspace it works in.
 */
export function AccountPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { data: me } = useMeQuery();
  const {
    data: workspaceData,
    error: workspaceError,
    refetch: refetchWorkspaces,
  } = useWorkspacesQuery();
  const workspaces = workspaceData ?? [];
  const {
    data: tokens,
    isLoading,
    error,
    refetch,
  } = useOwnPersonalAccessTokensQuery(workspaces, { skip: !workspaceData });
  const loadError = toApiError(workspaceError ?? error);
  const loading = (!workspaceData && !workspaceError) || isLoading;
  const retry = () => {
    if (!workspaceData || workspaceError) {
      void refetchWorkspaces();
    } else {
      void refetch();
    }
  };

  if (!me) {
    return <PageSkeleton />;
  }

  const groups = workspaces
    .map(workspace => ({
      workspace,
      tokens: tokens?.filter(item => item.workspace.id === workspace.id) ?? [],
    }))
    .filter(group => group.tokens.length > 0);

  return (
    <Page>
      <PageHeader title={t('account.title')} />
      <NameForm name={me.name} email={me.email} />
      <Separator />
      <PageSection
        title={t('tokens.title')}
        description={t('tokens.description')}
        actions={
          workspaces.length > 0 && <CreateTokenDialog workspaces={workspaces} />
        }
      >
        {(loading || loadError || tokens?.length === 0) && (
          <List>
            {loading && <ListSkeleton rows={2} />}
            {loadError && (
              <ListEmpty>
                <LoadError
                  text={describeError(loadError).text}
                  onRetry={retry}
                />
              </ListEmpty>
            )}
            {tokens?.length === 0 && (
              <ListEmpty>
                {workspaces.length > 0
                  ? t('tokens.empty')
                  : t('tokens.noWorkspaces')}
              </ListEmpty>
            )}
          </List>
        )}
        {groups.map(({ workspace, tokens: workspaceTokens }) => (
          <section
            key={workspace.id}
            aria-labelledby={`tokens-${workspace.id}`}
            className='flex min-w-0 flex-col gap-2'
          >
            <div className='flex items-center justify-between gap-3'>
              <h3
                id={`tokens-${workspace.id}`}
                className='min-w-0 text-sm font-medium break-words'
              >
                {workspace.name}
              </h3>
              <CopyButton
                text={mcpUrl(workspace.slug)}
                label={t('tokens.copyEndpoint')}
                icon={<Link2 />}
              />
            </div>
            <List>
              {workspaceTokens.map(({ token }) => (
                <PersonalAccessTokenRow
                  key={token.id}
                  workspaceId={workspace.id}
                  token={token}
                />
              ))}
            </List>
          </section>
        ))}
      </PageSection>
    </Page>
  );
}
