import { Fragment, useState, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { toApiError } from '@/shared/api';
import { useDescribeError, useFormatDate } from '@/shared/i18n';
import { Button, ConfirmDialog, ListRow } from '@/shared/ui';
import type { PersonalAccessTokenDto } from '@intentra/contracts/workspace';

import { useRevokePersonalAccessTokenMutation } from '../api/personal-access-token-api';

/**
 * A token in a list: its name, level and dates, and the way to revoke it.
 * Where it is not plain whose the token is, the list says so: `meta` for its
 * Member in a Workspace's list, `badge` for its Workspace in a person's own.
 */
export function PersonalAccessTokenRow({
  workspaceId,
  token,
  badge,
  meta,
  actions,
}: {
  readonly workspaceId: string;
  readonly token: PersonalAccessTokenDto;
  /** Shown beside the token's name. */
  readonly badge?: ReactNode;
  readonly meta?: ReactNode;
  /** Shown before the revoke button. */
  readonly actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const describeError = useDescribeError();
  const [revoke] = useRevokePersonalAccessTokenMutation();
  const [failure, setFailure] = useState<string | null>(null);
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
    const result = await revoke({ workspaceId, tokenId: token.id });
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
    return !error;
  };

  return (
    <ListRow
      lead={token.secretHint}
      meta={meta}
      actions={
        <>
          {actions}
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
        </>
      }
    >
      <p className='flex flex-wrap items-center gap-x-2.5 gap-y-0.5'>
        <span className='truncate text-sm font-medium'>{token.name}</span>
        {badge}
      </p>
      <p className='text-xs text-muted-foreground'>
        {facts.map((fact, index) => (
          // The dot stays with the fact before it, so no line starts with one.
          <Fragment key={index}>
            {index > 0 && ' '}
            <span className='whitespace-nowrap'>
              {fact}
              {index < facts.length - 1 && ' ·'}
            </span>
          </Fragment>
        ))}
      </p>
    </ListRow>
  );
}
