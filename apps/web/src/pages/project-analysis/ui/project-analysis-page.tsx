import { SearchCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import {
  isRunning,
  RUNNING_POLL_MS,
  useAnalysisRunsQuery,
  useStartAnalysisRunMutation,
} from '@/entities/analysis-run';
import { KnowledgeScopeProvider } from '@/entities/knowledge-item';
import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { API_TAGS, baseApi, toApiError, type ApiError } from '@/shared/api';
import { knowledgeItemPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  List,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
  Spinner,
} from '@/shared/ui';

import { AnalysisEmpty } from './analysis-empty';
import { NightlySchedule } from './nightly-schedule';
import { RunRow } from './run-row';

/** The runs the page shows, the newest first. */
const RUNS_SHOWN = 50;

/**
 * A Project's Analysis Runs: Intentra looking over the Approved knowledge for
 * contradictions and ambiguities, started here, and what each run found. A
 * running run is asked after until it finishes; then the knowledge it added
 * is read again.
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
  const [start, { isLoading: starting }] = useStartAnalysisRunMutation();
  const [failure, setFailure] = useState<ApiError | null>(null);
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });
  const items = runs.data?.items ?? [];
  const running = items.some(isRunning);
  const wasRunning = useRef(false);

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
  const runStart = async () => {
    const result = await start(scope);
    setFailure(toApiError(result.error));
  };
  // Beside what it changes: above the runs, or inside the empty state.
  const startButton = runs.data?.access.canStart && (
    <Button disabled={running || starting} onClick={() => void runStart()}>
      {running || starting ? <Spinner /> : <SearchCheck />}
      {running ? t('analysis.running') : t('analysis.start')}
    </Button>
  );

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
        />
        {failure && (
          <Alert variant='destructive'>
            <AlertDescription>{describeError(failure).text}</AlertDescription>
          </Alert>
        )}
        {runs.data && <NightlySchedule scope={scope} />}
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
          <AnalysisEmpty action={startButton} />
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
            actions={startButton}
          >
            <List>
              {items.map(run => (
                <RunRow key={run.id} run={run} nameOf={nameOf} />
              ))}
            </List>
          </PageSection>
        )}
      </Page>
    </KnowledgeScopeProvider>
  );
}
