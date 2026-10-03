import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import {
  isRunning,
  RUNNING_POLL_MS,
  uncheckedCount,
  useAnalysisRunsQuery,
  useStartAnalysisRunMutation,
} from '@/entities/analysis-run';
import {
  KNOWLEDGE_LIST_SIZE,
  KnowledgeScopeProvider,
  useKnowledgeItemsQuery,
} from '@/entities/knowledge-item';
import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { API_TAGS, baseApi, toApiError, type ApiError } from '@/shared/api';
import { knowledgeItemPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Alert,
  AlertDescription,
  IntentraButton,
  List,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';
import {
  AnalysisRunScopeDtoSchema,
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type AnalysisRunScopeDto,
} from '@intentra/contracts/workspace';

import { AnalysisEmpty } from './analysis-empty';
import { CoverageRow } from './coverage-row';
import { NightlySchedule } from './nightly-schedule';
import { RunRow } from './run-row';
import { WholeProjectRow } from './whole-project-row';

/** The runs the page shows, the newest first. */
const RUNS_SHOWN = 50;

/**
 * A Project's Analysis Runs: Intentra looking over the Drafts and Approved
 * knowledge, item by item, for contradictions and ambiguities; how much of it
 * is checked; the run over the Unchecked items started here, or, for a
 * Maintainer, one over the whole Project; and what each run found. A running
 * run is asked after until it finishes; then the knowledge it added is read
 * again.
 */
export function ProjectAnalysisPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const dispatch = useDispatch();
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project } = useCurrentProject(workspace?.id, workspaceAccess);
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  const skip = !workspace || !project;
  const [polling, setPolling] = useState(false);
  const runs = useAnalysisRunsQuery(
    { ...scope, page: { take: RUNS_SHOWN } },
    { skip, pollingInterval: polling ? RUNNING_POLL_MS : 0 },
  );
  const [start, { isLoading: starting, originalArgs: startedWith }] =
    useStartAnalysisRunMutation();
  const coverageHintId = useId();
  const [failure, setFailure] = useState<ApiError | null>(null);
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });
  // What each finding asks: the Project's Open Questions, read once.
  const { data: questions } = useKnowledgeItemsQuery(
    {
      ...scope,
      filter: {
        kind: KnowledgeKindDtoSchema.enum['open-question'],
        statuses: KnowledgeStatusDtoSchema.options,
        take: KNOWLEDGE_LIST_SIZE,
      },
    },
    { skip },
  );
  const items = runs.data?.items ?? [];
  const running = items.some(isRunning);
  const wasRunning = useRef(false);
  // The runs on the page when it first showed them: any other is new, and enters.
  const [known, setKnown] = useState<ReadonlySet<string> | null>(null);
  if (runs.data && known === null) {
    setKnown(new Set(runs.data.items.map(run => run.id)));
  }

  useEffect(() => {
    setPolling(running);
    // A run that just finished may have recorded Open Questions.
    if (wasRunning.current && !running) {
      dispatch(baseApi.util.invalidateTags([API_TAGS.knowledge]));
    }
    wasRunning.current = running;
  }, [running, dispatch]);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const loadError = toApiError(runs.error);
  const nameOf = (memberId: string) => {
    const member = members.find(candidate => candidate.id === memberId);
    return member ? member.name || member.email : undefined;
  };
  const runStart = async (runScope: AnalysisRunScopeDto) => {
    const result = await start({ ...scope, body: { scope: runScope } });
    setFailure(toApiError(result.error));
  };
  const startingScope = starting ? startedWith?.body.scope : undefined;
  const coverage = runs.data?.coverage;
  // Nothing Unchecked: the main action has nothing to do, and the coverage row says so.
  const nothingUnchecked =
    coverage !== undefined && uncheckedCount(coverage) === 0;
  // The page's one action, in Intentra's ink: in the header, or inside the
  // empty state. While one runs the row says so and there is nothing to
  // start: the action fades out where it stood, and back once it is done.
  const startButton = runs.data?.access.canStart && (
    <span
      inert={running}
      className={cn(
        'inline-flex transition-[opacity,scale,filter,visibility] duration-300 ease-out motion-reduce:transition-none',
        running && 'invisible scale-95 opacity-0 blur-[2px]',
      )}
    >
      <IntentraButton
        size='default'
        busy={startingScope === AnalysisRunScopeDtoSchema.enum.unchecked}
        disabled={starting || running || nothingUnchecked}
        aria-describedby={nothingUnchecked ? coverageHintId : undefined}
        onClick={() => void runStart(AnalysisRunScopeDtoSchema.enum.unchecked)}
      >
        {t('analysis.start')}
      </IntentraButton>
    </span>
  );
  const hasRuns = items.length > 0;
  // Before the first run everything is Unchecked: the empty state says it all.
  const showWholeProject =
    hasRuns && runs.data?.access.canStartWholeProject === true;

  return (
    <KnowledgeScopeProvider
      scope={{
        ...scope,
        itemPath: key => knowledgeItemPath(workspace.slug, project.slug, key),
      }}
    >
      <Page>
        <PageHeader
          title={t('analysis.title')}
          description={t('analysis.description')}
          actions={hasRuns && startButton}
        />
        {failure && (
          <Alert variant='destructive'>
            <AlertDescription>{describeError(failure).text}</AlertDescription>
          </Alert>
        )}
        {runs.data && (
          // Until the schedule is read, a block with nothing in it stays hidden.
          <List className='empty:hidden'>
            {hasRuns && coverage && (
              <CoverageRow coverage={coverage} hintId={coverageHintId} />
            )}
            <NightlySchedule scope={scope} />
            {showWholeProject && (
              <WholeProjectRow
                busy={
                  startingScope ===
                  AnalysisRunScopeDtoSchema.enum['whole-project']
                }
                disabled={starting || running}
                onStart={() =>
                  void runStart(AnalysisRunScopeDtoSchema.enum['whole-project'])
                }
              />
            )}
          </List>
        )}
        {loadError ? (
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => void runs.refetch()}
          />
        ) : !runs.data ? (
          <List aria-busy>
            <ListSkeleton />
          </List>
        ) : items.length === 0 ? (
          <AnalysisEmpty
            nothingToCheck={coverage?.total === 0}
            action={coverage?.total === 0 ? null : startButton}
          />
        ) : (
          <PageSection
            title={
              <span className='flex items-center gap-2'>
                {t('analysis.history')}
                <span className='font-mono font-normal text-muted-foreground tabular-nums'>
                  {runs.data.total}
                </span>
              </span>
            }
          >
            <List>
              {items.map(run => (
                <RunRow
                  entering={known !== null && !known.has(run.id)}
                  key={run.id}
                  run={run}
                  nameOf={nameOf}
                  questions={questions?.items ?? []}
                />
              ))}
            </List>
          </PageSection>
        )}
      </Page>
    </KnowledgeScopeProvider>
  );
}
