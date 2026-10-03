import { Plus } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  ChangeBadge,
  changeKinds,
  useAgentsChangesQuery,
  useUnpublishedAgentsQuery,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import {
  PLATFORM_PAGES,
  platformAgentPath,
  platformPath,
} from '@/shared/config';
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
import {
  AgentRoleDtoSchema,
  type PlatformAgentDto,
} from '@intentra/contracts/workspace';

const { intentra, auditor, specialist } = AgentRoleDtoSchema.enum;

/** Intentra first, the Auditor next, then the Specialists by name. */
function inOrder(agents: readonly PlatformAgentDto[]): PlatformAgentDto[] {
  const rank = AgentRoleDtoSchema.options;

  return [...agents].sort(
    (one, other) =>
      rank.indexOf(one.role) - rank.indexOf(other.role) ||
      one.name.localeCompare(other.name),
  );
}

/** Intentra's Agents as the Platform Admin is editing them, each marked if it differs from the Published Agents. */
export function PlatformAgentsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const unpublished = useUnpublishedAgentsQuery();
  const { data: changes } = useAgentsChangesQuery();
  const error = toApiError(unpublished.error);
  const content = unpublished.data?.content;
  const publishedNumber = unpublished.data?.publishedNumber ?? null;
  const kinds = changeKinds(changes?.agents);
  const hasIntentra =
    content?.agents.some(agent => agent.role === intentra) ?? false;
  const hasAuditor =
    content?.agents.some(agent => agent.role === auditor) ?? false;
  const profileName = (id: string) =>
    content?.modelProfiles.find(profile => profile.id === id)?.name;

  const createAction =
    content &&
    content.modelProfiles.length > 0 &&
    (hasIntentra ? (
      <>
        {!hasAuditor && (
          <Button
            variant='outline'
            render={<Link to={platformAgentPath({ newRole: auditor })} />}
            nativeButton={false}
          >
            <Plus />
            {t('platformAgents.createAuditor')}
          </Button>
        )}
        <Button
          render={<Link to={platformAgentPath({ newRole: specialist })} />}
          nativeButton={false}
        >
          <Plus />
          {t('platformAgents.createSpecialist')}
        </Button>
      </>
    ) : (
      <Button
        render={<Link to={platformAgentPath({ newRole: intentra })} />}
        nativeButton={false}
      >
        <Plus />
        {t('platformAgents.createIntentra')}
      </Button>
    ));

  return (
    <Page>
      <PageHeader
        title={t('platform.pages.agents')}
        description={
          unpublished.data &&
          (publishedNumber === null
            ? t('platformAgents.descriptionNothing')
            : t('platformAgents.descriptionPublished', {
                number: publishedNumber,
              }))
        }
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
          ) : content.agents.length === 0 ? (
            content.modelProfiles.length === 0 ? (
              <ListEmpty
                action={
                  <Button
                    variant='outline'
                    render={
                      <Link to={platformPath(PLATFORM_PAGES.modelProfiles)} />
                    }
                    nativeButton={false}
                  >
                    {t('platformAgents.toModels')}
                  </Button>
                }
              >
                {t('platformAgents.emptyNoModels')}
              </ListEmpty>
            ) : (
              <ListEmpty action={createAction}>
                {t('platformAgents.empty')}
              </ListEmpty>
            )
          ) : (
            inOrder(content.agents).map(agent => {
              const kind = kinds.get(agent.id);
              const role = t(`platform.roles.${agent.role}`);
              return (
                <ListRow
                  key={agent.id}
                  interactive
                  meta={
                    <span className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                      {kind && <ChangeBadge kind={kind} />}
                      <span>{profileName(agent.modelProfileId)}</span>
                      <span>
                        <Trans
                          i18nKey='platform.tools'
                          count={agent.tools.length}
                          components={{
                            mono: <span className='font-mono tabular-nums' />,
                          }}
                        />
                      </span>
                    </span>
                  }
                >
                  <p className='flex flex-wrap items-baseline gap-x-2 text-sm'>
                    <Link
                      to={platformAgentPath({ id: agent.id })}
                      className={`font-medium ${LIST_ROW_LINK_CLASS}`}
                    >
                      {agent.name}
                    </Link>
                    {/* Intentra and the Auditor are usually named after their role. */}
                    {role !== agent.name && (
                      <span className='text-xs text-muted-foreground'>
                        {role}
                      </span>
                    )}
                  </p>
                  <p className='mt-0.5 line-clamp-1 text-sm text-muted-foreground'>
                    {agent.description}
                  </p>
                </ListRow>
              );
            })
          )}
        </List>
      )}
    </Page>
  );
}
