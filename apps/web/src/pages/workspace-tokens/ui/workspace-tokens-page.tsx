import { Fragment, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { useDescribeError, useFormatDate } from '@/shared/i18n';
import {
  Button,
  ConfirmDialog,
  CopyField,
  List,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';
import type {
  PersonalAccessTokenDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import {
  usePersonalAccessTokensQuery,
  useRevokePersonalAccessTokenMutation,
} from '../api/personal-access-token-api';
import { mcpUrl } from '../model/mcp';

import { CreateTokenDialog } from './create-token-dialog';

/** Personal Access Tokens through which external agents reach the Workspace over MCP. */
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
        description={t('tokens.description')}
        actions={<CreateTokenDialog workspace={workspace} />}
      />
      <div className='flex max-w-lg flex-col gap-2'>
        <p className='text-sm font-medium'>{t('tokens.endpoint')}</p>
        <CopyField value={mcpUrl()} label={t('tokens.endpoint')} />
      </div>
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
          {tokens?.length === 0 && <ListEmpty>{t('tokens.empty')}</ListEmpty>}
          {tokens?.map(token => (
            <TokenRow
              key={token.id}
              workspace={workspace}
              access={access}
              token={token}
            />
          ))}
        </List>
      </PageSection>
    </Page>
  );
}

function TokenRow({
  workspace,
  access,
  token,
}: {
  readonly workspace: WorkspaceDto;
  readonly access: WorkspaceAccessDto;
  readonly token: PersonalAccessTokenDto;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const describeError = useDescribeError();
  const [revoke] = useRevokePersonalAccessTokenMutation();
  const [failure, setFailure] = useState<string | null>(null);
  const someoneElses = token.memberId !== access.memberId;
  const mono = { mono: <span className='font-mono' /> };
  const facts = [
    t(`projectRoles.${token.level}`),
    <Trans
      key='created'
      i18nKey='tokens.created'
      values={{ date: formatDate(token.createdAt) }}
      components={mono}
    />,
    token.expiresAt ? (
      <Trans
        key='expires'
        i18nKey='tokens.expires'
        values={{ date: formatDate(token.expiresAt) }}
        components={mono}
      />
    ) : (
      t('tokens.noExpiry')
    ),
    token.lastUsedAt ? (
      <Trans
        key='used'
        i18nKey='tokens.lastUsed'
        values={{ date: formatDate(token.lastUsedAt) }}
        components={mono}
      />
    ) : (
      t('tokens.neverUsed')
    ),
  ];

  const onRevoke = async () => {
    const result = await revoke({
      workspaceId: workspace.id,
      tokenId: token.id,
    });
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
    return !error;
  };

  return (
    <ListRow
      lead={token.secretHint}
      meta={someoneElses ? token.memberEmail : undefined}
      actions={
        <ConfirmDialog
          trigger={
            <Button variant='ghost' size='sm'>
              {t('tokens.revoke')}
            </Button>
          }
          title={t('tokens.revokeTitle', { name: token.name })}
          description={t('tokens.revokeDescription')}
          confirmLabel={t('tokens.revokeConfirm')}
          error={failure}
          onConfirm={onRevoke}
        />
      }
    >
      <p className='flex items-center gap-2 text-sm font-medium'>
        <span className='truncate'>{token.name}</span>
      </p>
      <p className='text-xs text-muted-foreground'>
        {facts.map((fact, index) => (
          <Fragment key={index}>
            {index > 0 && ' '}
            <span className='whitespace-nowrap'>
              {index > 0 && '· '}
              {fact}
            </span>
          </Fragment>
        ))}
      </p>
    </ListRow>
  );
}
