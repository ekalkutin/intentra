import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  List,
  ListRow,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  Switch,
} from '@/shared/ui';

import {
  useOpenSignUpQuery,
  useOpenWorkspaceCreationQuery,
  useSetOpenSignUpMutation,
  useSetOpenWorkspaceCreationMutation,
} from '../api/platform-settings-api';

/** The platform's own settings: who may sign up, and who may create a Workspace. */
export function PlatformSettingsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const signUp = useOpenSignUpQuery();
  const creation = useOpenWorkspaceCreationQuery();
  const [setSignUp, signUpSaving] = useSetOpenSignUpMutation();
  const [setCreation, creationSaving] = useSetOpenWorkspaceCreationMutation();
  const loadError = toApiError(signUp.error ?? creation.error);

  return (
    <Page className='max-w-3xl'>
      <PageHeader
        title={t('platformSettings.title')}
        description={t('platformSettings.description')}
      />
      <PageSection title={t('platformSettings.access')}>
        {loadError ? (
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => {
              void signUp.refetch();
              void creation.refetch();
            }}
          />
        ) : (
          <List>
            {!signUp.data || !creation.data ? (
              <ListSkeleton rows={2} />
            ) : (
              <>
                <SettingRow
                  title={t('platformSettings.signUp')}
                  on={t('platformSettings.signUpOn')}
                  off={t('platformSettings.signUpOff')}
                  checked={signUp.data.open}
                  saving={signUpSaving.isLoading}
                  error={toApiError(signUpSaving.error)}
                  onChange={open => setSignUp({ open })}
                />
                <SettingRow
                  title={t('platformSettings.workspaceCreation')}
                  on={t('platformSettings.workspaceCreationOn')}
                  off={t('platformSettings.workspaceCreationOff')}
                  checked={creation.data.open}
                  saving={creationSaving.isLoading}
                  error={toApiError(creationSaving.error)}
                  onChange={open => setCreation({ open })}
                />
              </>
            )}
          </List>
        )}
      </PageSection>
    </Page>
  );
}

/** One on/off setting: what it is, what it means in its current state, and its switch. */
function SettingRow({
  title,
  on,
  off,
  checked,
  saving,
  error,
  onChange,
}: {
  readonly title: string;
  /** What it means while on. */
  readonly on: string;
  /** What it means while off. */
  readonly off: string;
  readonly checked: boolean;
  readonly saving: boolean;
  readonly error: ReturnType<typeof toApiError>;
  readonly onChange: (checked: boolean) => void;
}) {
  const id = useId();
  const describeError = useDescribeError();
  // The switch moves at once; the server's answer settles it.
  const [pending, setPending] = useState<boolean | null>(null);
  const shown = saving && pending !== null ? pending : checked;

  return (
    <ListRow
      actions={
        <Switch
          id={id}
          checked={shown}
          disabled={saving}
          aria-describedby={`${id}-hint`}
          onCheckedChange={next => {
            setPending(next);
            onChange(next);
          }}
        />
      }
    >
      <label htmlFor={id} className='block text-sm font-medium'>
        {title}
      </label>
      <p
        id={`${id}-hint`}
        className='mt-0.5 text-sm text-pretty text-muted-foreground'
      >
        {shown ? on : off}
      </p>
      {error && (
        <p role='alert' className='mt-1 text-sm text-destructive'>
          {describeError(error).text}
        </p>
      )}
    </ListRow>
  );
}
