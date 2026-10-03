import { Plus } from 'lucide-react';
import { useState } from 'react';
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
  StatusBadge,
} from '@/shared/ui';
import type {
  AgentsChangeKindDto,
  ModelProfileDto,
  PlatformAgentDto,
} from '@intentra/contracts/workspace';

import type { ModelOffer } from '../model/openrouter-models';
import { useCatalog, useModelFormat, type Catalog } from '../model/use-catalog';

import { ModelProfileDialog } from './model-profile-dialog';
import { OpenRouterCatalog } from './openrouter-catalog';

/** The built-in Model Profiles, each with its settings and the Agents on it. */
export function PlatformModelsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const unpublished = useUnpublishedAgentsQuery();
  const { data: changes } = useAgentsChangesQuery();
  const error = toApiError(unpublished.error);
  const content = unpublished.data?.content;
  const kinds = changeKinds(changes?.modelProfiles);
  const [preset, setPreset] = useState<ModelOffer | null>(null);
  const catalog = useCatalog(
    content?.modelProfiles.map(profile => profile.modelId) ?? [],
  );

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
        <List>
          <ListEmpty>
            <LoadError
              text={describeError(error).text}
              onRetry={() => void unpublished.refetch()}
            />
          </ListEmpty>
        </List>
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
                  catalog={catalog}
                />
              ))
          )}
        </List>
      )}
      <OpenRouterCatalog
        catalog={catalog}
        profiles={content?.modelProfiles ?? []}
        onChoose={setPreset}
      />
      {preset && (
        <ModelProfileDialog
          key={preset.id}
          profile={null}
          preset={preset}
          onClosed={() => setPreset(null)}
        />
      )}
    </Page>
  );
}

function ModelProfileRow({
  profile,
  users,
  changeKind,
  catalog,
}: {
  readonly profile: ModelProfileDto;
  readonly users: readonly PlatformAgentDto[];
  readonly changeKind: AgentsChangeKindDto | null;
  readonly catalog: Catalog;
}) {
  const { t, i18n } = useTranslation();
  const format = useModelFormat();
  const offer = catalog.offerOf(profile.modelId);
  const stats = catalog.statsOf(profile.modelId);
  /** The model left the list of those Agents run on, once the list is in. */
  const missing = catalog.offers.offers !== undefined && !offer;
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
      {missing ? (
        <StatusBadge status='review' className='mt-1'>
          {t('platformModels.notInCatalog')}
        </StatusBadge>
      ) : (
        offer && (
          <p className='mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground tabular-nums'>
            <span>
              {format.price(offer.inputPrice)} /{' '}
              {format.price(offer.outputPrice)}
            </span>
            <span>{format.context(offer.contextLength)}</span>
            {catalog.hasKey && (
              <>
                <span>
                  {stats === undefined
                    ? '…'
                    : stats.throughput === null
                      ? '—'
                      : format.speed(stats.throughput)}
                </span>
                <span>
                  {stats === undefined
                    ? '…'
                    : stats.latency === null
                      ? '—'
                      : format.latency(stats.latency)}
                </span>
              </>
            )}
          </p>
        )
      )}
      {facts.length > 0 && (
        <p className='mt-1 text-xs text-muted-foreground'>
          {facts.join(' · ')}
        </p>
      )}
    </ListRow>
  );
}
