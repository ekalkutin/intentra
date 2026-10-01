import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  ChangeBadge,
  changeKinds,
  useAgentsChangesQuery,
  useUnpublishedAgentsQuery,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
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
} from '@/shared/ui';
import type {
  AgentsChangeKindDto,
  ModelProfileDto,
  PlatformAgentDto,
} from '@intentra/contracts/workspace';

import { ModelProfileDialog } from './model-profile-dialog';

/** The built-in Model Profiles, each with its settings and the Agents on it. */
export function PlatformModelsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const unpublished = useUnpublishedAgentsQuery();
  const { data: changes } = useAgentsChangesQuery();
  const error = toApiError(unpublished.error);
  const content = unpublished.data?.content;
  const kinds = changeKinds(changes?.modelProfiles);

  const createAction = (
    <ModelProfileDialog
      profile={null}
      trigger={
        <Button>
          <Plus />
          {t('platformModels.create')}
        </Button>
      }
    />
  );

  return (
    <Page>
      <PageHeader
        title={t('platform.pages.modelProfiles')}
        description={t('platformModels.description')}
        actions={createAction}
      />
      {error ? (
        <LoadError
          text={describeError(error).text}
          onRetry={() => void unpublished.refetch()}
        />
      ) : (
        <List aria-busy={!content}>
          {!content ? (
            <ListSkeleton />
          ) : content.modelProfiles.length === 0 ? (
            <ListEmpty>{t('platformModels.empty')}</ListEmpty>
          ) : (
            [...content.modelProfiles]
              .sort((one, other) => one.name.localeCompare(other.name))
              .map(profile => (
                <ModelProfileRow
                  key={profile.id}
                  profile={profile}
                  users={content.agents.filter(
                    agent => agent.modelProfileId === profile.id,
                  )}
                  changeKind={kinds.get(profile.id) ?? null}
                />
              ))
          )}
        </List>
      )}
    </Page>
  );
}

function ModelProfileRow({
  profile,
  users,
  changeKind,
}: {
  readonly profile: ModelProfileDto;
  readonly users: readonly PlatformAgentDto[];
  readonly changeKind: AgentsChangeKindDto | null;
}) {
  const { t, i18n } = useTranslation();
  const facts = [
    profile.temperature !== null &&
      t('platformModels.factTemperature', { value: profile.temperature }),
    profile.reasoningEffort !== null &&
      t('platformModels.factReasoning', {
        value: t(
          `platformModels.reasoning.${profile.reasoningEffort}`,
        ).toLocaleLowerCase(i18n.language),
      }),
    profile.maxOutputTokens !== null &&
      t('platformModels.factMaxTokens', {
        value: profile.maxOutputTokens.toLocaleString(i18n.language),
      }),
  ].filter(Boolean);

  return (
    <ListRow
      interactive
      meta={
        <span className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          {changeKind && <ChangeBadge kind={changeKind} />}
          <span>
            {users.length > 0
              ? t('platform.usedBy', { count: users.length })
              : t('platform.unused')}
          </span>
        </span>
      }
    >
      <ModelProfileDialog
        profile={profile}
        users={users}
        trigger={
          <button
            type='button'
            className={`block text-left text-sm font-medium ${LIST_ROW_LINK_CLASS}`}
          >
            {profile.name}
          </button>
        }
      />
      <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground'>
        {profile.modelId}
      </p>
      {facts.length > 0 && (
        <p className='mt-1 text-xs text-muted-foreground'>
          {facts.join(' · ')}
        </p>
      )}
    </ListRow>
  );
}
