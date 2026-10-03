import { CircleCheck, TriangleAlert } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  ChangeBadge,
  countChanges,
  useAgentsChangesQuery,
  usePublishAgentsMutation,
  useUnpublishedAgentsQuery,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import {
  PLATFORM_PAGES,
  platformAgentPath,
  platformPath,
  platformSkillPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  List,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  Spinner,
  Textarea,
} from '@/shared/ui';
import {
  AgentsChangeKindDtoSchema,
  type AgentsChangeDto,
  type AgentsContentDto,
  type PublishingProblemDto,
} from '@intentra/contracts/workspace';

const NOTE_MAX = 500;

/** Where a changed object opens; nowhere once it is removed. */
type Opener = (id: string) => string | null;

/**
 * What publishing would change, object by object, and what keeps it from
 * being published; then publishing with an optional note.
 */
export function PlatformChangesPage() {
  const { t } = useTranslation();
  const id = useId();
  const describeError = useDescribeError();
  const unpublished = useUnpublishedAgentsQuery();
  const changes = useAgentsChangesQuery();
  const [publish, { isLoading: publishing }] = usePublishAgentsMutation();
  const [note, setNote] = useState('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState<number | null>(null);
  const error = toApiError(unpublished.error ?? changes.error);
  const content = unpublished.data?.content;
  const publishedNumber = unpublished.data?.publishedNumber ?? null;
  const nextNumber = (publishedNumber ?? 0) + 1;
  const changeList = changes.data;
  const changed = countChanges(changeList);
  const problems = changeList?.problems ?? [];

  const submit = async () => {
    setPublishError(null);
    const result = await publish({ note: note.trim() === '' ? null : note });
    const failure = toApiError(result.error);
    if (failure) {
      setPublishError(describeError(failure).text);
      return;
    }
    setNote('');
    setJustPublished(result.data?.number ?? null);
  };

  const sorts: readonly {
    readonly key: 'agents' | 'skills' | 'modelProfiles';
    readonly open: Opener;
  }[] = [
    { key: 'agents', open: agentId => platformAgentPath({ id: agentId }) },
    { key: 'skills', open: skillId => platformSkillPath(skillId) },
    {
      key: 'modelProfiles',
      open: () => platformPath(PLATFORM_PAGES.modelProfiles),
    },
  ];

  return (
    <Page>
      <PageHeader
        title={t('platform.pages.changes')}
        description={
          unpublished.data &&
          (publishedNumber === null
            ? t('platformChanges.descriptionNothing')
            : t('platformChanges.descriptionPublished', {
                number: publishedNumber,
              }))
        }
      />
      {justPublished !== null && (
        <Alert>
          <CircleCheck className='text-success' />
          <AlertDescription>
            {t('platformChanges.published', { number: justPublished })}
          </AlertDescription>
        </Alert>
      )}
      {error ? (
        <List>
          <ListEmpty>
            <LoadError
              text={describeError(error).text}
              onRetry={() => {
                void unpublished.refetch();
                void changes.refetch();
              }}
            />
          </ListEmpty>
        </List>
      ) : !changeList || !content ? (
        <List aria-busy>
          <ListSkeleton />
        </List>
      ) : (
        <>
          {problems.length > 0 && (
            <PageSection
              title={t('platformChanges.problems')}
              description={t('platformChanges.problemsHint')}
            >
              <List>
                {problems.map((problem, index) => (
                  <ProblemRow
                    key={`${problem.code}-${problem.subject?.id ?? problem.subject?.name ?? index}-${problem.tool ?? ''}`}
                    problem={problem}
                    content={content}
                  />
                ))}
              </List>
            </PageSection>
          )}
          {changed === 0 ? (
            <List>
              <ListEmpty>
                {publishedNumber === null
                  ? t('platformChanges.noneNothing')
                  : t('platformChanges.none')}
              </ListEmpty>
            </List>
          ) : (
            sorts
              .filter(sort => changeList[sort.key].length > 0)
              .map(sort => (
                <PageSection
                  key={sort.key}
                  title={t(`platformChanges.${sort.key}`)}
                >
                  <List>
                    {changeList[sort.key].map(change => (
                      <ChangeRow
                        key={change.id}
                        change={change}
                        open={sort.open}
                      />
                    ))}
                  </List>
                </PageSection>
              ))
          )}
          {changed > 0 && (
            <PageSection
              title={t('platformChanges.publish')}
              description={t('platformChanges.publishHint', {
                number: nextNumber,
              })}
            >
              <div className='flex max-w-lg flex-col gap-4'>
                <Field>
                  <FieldLabel htmlFor={`${id}-note`}>
                    {t('platformChanges.note')}
                  </FieldLabel>
                  <Textarea
                    id={`${id}-note`}
                    rows={2}
                    maxLength={NOTE_MAX}
                    value={note}
                    onChange={event => setNote(event.target.value)}
                  />
                  <FieldDescription>
                    {t('platformChanges.noteHint')}
                  </FieldDescription>
                </Field>
                {publishError && (
                  <Alert variant='destructive'>
                    <AlertDescription>{publishError}</AlertDescription>
                  </Alert>
                )}
                <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
                  <Button
                    disabled={publishing || problems.length > 0}
                    onClick={() => void submit()}
                  >
                    {publishing && <Spinner />}
                    {t('platformChanges.submit', { number: nextNumber })}
                  </Button>
                  {problems.length > 0 && (
                    <p className='text-sm text-muted-foreground'>
                      {t('platformChanges.blocked')}
                    </p>
                  )}
                </div>
              </div>
            </PageSection>
          )}
        </>
      )}
    </Page>
  );
}

function ChangeRow({
  change,
  open,
}: {
  readonly change: AgentsChangeDto;
  readonly open: Opener;
}) {
  const { t } = useTranslation();
  const to =
    change.kind === AgentsChangeKindDtoSchema.enum.removed
      ? null
      : open(change.id);

  return (
    <ListRow meta={<ChangeBadge kind={change.kind} />}>
      <p className='text-sm font-medium'>
        {to ? (
          <Link to={to} className='underline-offset-[0.2em] hover:underline'>
            {change.name}
          </Link>
        ) : (
          change.name
        )}
      </p>
      {change.fields.length > 0 && (
        <p className='mt-0.5 text-sm text-muted-foreground'>
          {t('platformChanges.changedFields', {
            fields: change.fields
              .map(field => t(`platformChanges.fields.${field}`, field))
              .join(', '),
          })}
        </p>
      )}
    </ListRow>
  );
}

function ProblemRow({
  problem,
  content,
}: {
  readonly problem: PublishingProblemDto;
  readonly content: AgentsContentDto;
}) {
  const { t } = useTranslation();
  const subjectId = problem.subject?.id ?? null;
  const to = !subjectId
    ? null
    : content.agents.some(agent => agent.id === subjectId)
      ? platformAgentPath({ id: subjectId })
      : content.skills.some(skill => skill.id === subjectId)
        ? platformSkillPath(subjectId)
        : null;

  return (
    <ListRow
      actions={
        to && (
          <Button
            variant='outline'
            size='sm'
            render={<Link to={to} />}
            nativeButton={false}
          >
            {t('platformChanges.open')}
          </Button>
        )
      }
    >
      <p className='flex items-start gap-2 text-sm'>
        <TriangleAlert
          aria-hidden
          className='mt-0.5 size-4 shrink-0 text-warning'
        />
        <span>
          {t(`platformChanges.problemTexts.${problem.code}`, {
            name: problem.subject?.name ?? '',
            tool: problem.tool ?? '',
          })}
        </span>
      </p>
    </ListRow>
  );
}
