import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  ChangeBadge,
  changeKinds,
  useAgentsChangesQuery,
  useUnpublishedAgentsQuery,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import { platformSkillPath } from '@/shared/config';
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

/** Intentra's own Skills, each with how many Agents use it. */
export function PlatformSkillsPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const unpublished = useUnpublishedAgentsQuery();
  const { data: changes } = useAgentsChangesQuery();
  const error = toApiError(unpublished.error);
  const content = unpublished.data?.content;
  const kinds = changeKinds(changes?.skills);
  const usedBy = (skillId: string) =>
    content?.agents.filter(agent => agent.skillIds.includes(skillId)).length ??
    0;

  const createAction = (
    <Button render={<Link to={platformSkillPath()} />} nativeButton={false}>
      <Plus />
      {t('platformSkills.create')}
    </Button>
  );

  return (
    <Page>
      <PageHeader
        title={t('platform.pages.skills')}
        description={t('platformSkills.description')}
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
          ) : content.skills.length === 0 ? (
            <ListEmpty>{t('platformSkills.empty')}</ListEmpty>
          ) : (
            [...content.skills]
              .sort((one, other) => one.name.localeCompare(other.name))
              .map(skill => {
                const kind = kinds.get(skill.id);
                const count = usedBy(skill.id);
                return (
                  <ListRow
                    key={skill.id}
                    interactive
                    meta={
                      <span className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                        {kind && <ChangeBadge kind={kind} />}
                        <span>
                          {count > 0
                            ? t('platform.usedBy', { count })
                            : t('platform.unused')}
                        </span>
                      </span>
                    }
                  >
                    <Link
                      to={platformSkillPath(skill.id)}
                      className={`block font-mono text-xs leading-5 font-medium ${LIST_ROW_LINK_CLASS}`}
                    >
                      {skill.name}
                    </Link>
                    <p className='mt-0.5 line-clamp-1 text-sm text-muted-foreground'>
                      {skill.description}
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
