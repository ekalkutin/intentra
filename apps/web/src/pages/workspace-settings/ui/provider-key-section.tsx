import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/shared/api';
import { useDescribeError, useFormatDate } from '@/shared/i18n';
import {
  Button,
  ConfirmDialog,
  List,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  PageSection,
} from '@/shared/ui';
import type {
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import {
  useProviderKeyQuery,
  useRemoveProviderKeyMutation,
} from '../api/provider-key-api';
import { PROVIDER_KEY_ERROR_CODES } from '../model/error-codes';

import { ProviderKeyForm } from './provider-key-form';

/**
 * The Workspace's OpenRouter key, on which its Agents run: its hint, who
 * added it and when for everyone; adding, replacing and removing for an Owner.
 */
export function ProviderKeySection({
  workspace,
  access,
}: {
  readonly workspace: WorkspaceDto;
  readonly access: WorkspaceAccessDto;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const formatDate = useFormatDate();
  const key = useProviderKeyQuery(workspace.id);
  const [remove] = useRemoveProviderKeyMutation();
  const [replacing, setReplacing] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const error = toApiError(key.error);
  const missing = error?.code === PROVIDER_KEY_ERROR_CODES.notFound;
  const canManage = access.canManageProviderKey && !access.suspended;
  const current = missing ? undefined : key.currentData;

  const onRemove = async () => {
    const result = await remove(workspace.id);
    const failure = toApiError(result.error);
    setRemoveError(failure ? describeError(failure).text : null);
    return !failure;
  };

  const body = () => {
    if (error && !missing) {
      return (
        <LoadError
          text={describeError(error).text}
          onRetry={() => void key.refetch()}
        />
      );
    }
    if (!current && !missing) {
      return (
        <List aria-busy>
          <ListSkeleton rows={1} />
        </List>
      );
    }
    if (!current) {
      return canManage ? (
        <ProviderKeyForm workspaceId={workspace.id} />
      ) : (
        <List>
          <ListEmpty>{t('providerKey.none')}</ListEmpty>
        </List>
      );
    }
    return (
      <div className='flex flex-col gap-4'>
        <List>
          <ListRow
            meta={t('providerKey.added', {
              who: current.addedByName ?? t('providerKey.formerMember'),
              date: formatDate(current.addedAt),
            })}
            actions={
              canManage &&
              !replacing && (
                <>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setReplacing(true)}
                  >
                    {t('providerKey.replace')}
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        className='text-muted-foreground hover:text-destructive'
                        aria-label={t('providerKey.remove')}
                      >
                        <Trash2 />
                      </Button>
                    }
                    title={t('providerKey.removeTitle')}
                    description={t('providerKey.removeDescription')}
                    confirmLabel={t('providerKey.remove')}
                    error={removeError}
                    onConfirm={onRemove}
                  />
                </>
              )
            }
          >
            <p className='font-mono text-sm leading-5'>{current.hint}</p>
          </ListRow>
        </List>
        {replacing && (
          <ProviderKeyForm
            workspaceId={workspace.id}
            onDone={() => setReplacing(false)}
            onCancel={() => setReplacing(false)}
          />
        )}
      </div>
    );
  };

  return (
    <PageSection
      title={t('providerKey.title')}
      description={t('providerKey.description')}
    >
      {body()}
    </PageSection>
  );
}
