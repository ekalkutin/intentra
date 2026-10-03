import { useTranslation } from 'react-i18next';

import {
  mcpUrl,
  PersonalAccessTokenRow,
  usePersonalAccessTokensQuery,
} from '@/entities/personal-access-token';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  CopyField,
  List,
  ListEmpty,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';

/**
 * The Personal Access Tokens that reach this Workspace over MCP, as its
 * Owner oversees them: everyone's, each with its Member, and the way to
 * revoke one. A person creates and keeps their own in the account settings.
 */
export function WorkspaceTokensPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { workspace, access } = useCurrentWorkspace();
  const {
    data: tokens,
    isLoading,
    error,
    refetch,
  } = usePersonalAccessTokensQuery(workspace?.id ?? '', { skip: !workspace });
  const loadError = toApiError(error);

  if (!workspace || !access) {
    return <PageSkeleton />;
  }

  return (
    <Page>
      <PageHeader
        title={t('tokens.title')}
        description={t('tokens.workspaceDescription')}
      />
      <PageSection
        title={t('tokens.endpoint')}
        description={t('tokens.endpointDescription')}
      >
        <div className='max-w-lg'>
          <CopyField
            value={mcpUrl(workspace.slug)}
            label={t('tokens.endpoint')}
          />
        </div>
      </PageSection>
      <PageSection
        title={
          access.canSeeAllPersonalAccessTokens
            ? t('tokens.allTokens')
            : t('tokens.ownTokens')
        }
      >
        <List>
          {isLoading && <ListSkeleton rows={2} />}
          {loadError && (
            <ListEmpty>
              <LoadError
                text={describeError(loadError).text}
                onRetry={() => void refetch()}
              />
            </ListEmpty>
          )}
          {tokens?.length === 0 && (
            <ListEmpty>{t('tokens.workspaceEmpty')}</ListEmpty>
          )}
          {tokens?.map(token => (
            <PersonalAccessTokenRow
              key={token.id}
              workspaceId={workspace.id}
              token={token}
              meta={
                token.memberId === access.memberId
                  ? t('common.you')
                  : token.memberEmail
              }
            />
          ))}
        </List>
      </PageSection>
    </Page>
  );
}
