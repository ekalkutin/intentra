import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import {
  KNOWLEDGE_VIEWS,
  KnowledgeScopeProvider,
  parseKnowledgeKind,
  parseKnowledgeView,
  useKnowledgeSummaryQuery,
  viewCount,
  viewTotal,
  type KnowledgeListState,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { KNOWLEDGE_SEARCH_PARAMS, knowledgeItemPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  List,
  ListEmpty,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
  TableCell,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import type { KnowledgeKindDto } from '@intentra/contracts/workspace';

import { KindGroup } from './kind-group';
import { KindNav, KindSelect, ViewNav } from './kind-nav';
import {
  columnCount,
  KindTable,
  KindTableRows,
  KindTableSkeleton,
} from './kind-table';
import { PagedPart } from './paged-part';
import { RecordMenu } from './record-menu';

/** Views where every item has the same status, so rows need not repeat it. */
const SINGLE_STATUS_VIEWS: readonly KnowledgeView[] = [
  KNOWLEDGE_VIEWS.drafts,
  KNOWLEDGE_VIEWS.rejected,
  KNOWLEDGE_VIEWS.obsolete,
];

/**
 * A Project's knowledge: a status view (current, Drafts, Needs Review,
 * Rejected, Obsolete) and a Kind, chosen beside the list (above it where
 * narrow). Every count comes from the Project's summary; every Kind is a
 * group read a page at a time once it comes near the screen, or one Kind is
 * a table of its fields.
 */
export function ProjectKnowledgePage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { search } = useLocation();
  const [params, setParams] = useSearchParams();
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project } = useCurrentProject(workspace?.id, workspaceAccess);
  const view = parseKnowledgeView(params.get(KNOWLEDGE_SEARCH_PARAMS.view));
  const kind = parseKnowledgeKind(params.get(KNOWLEDGE_SEARCH_PARAMS.kind));
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  const {
    data: summary,
    error,
    refetch,
  } = useKnowledgeSummaryQuery(scope, {
    skip: !workspace || !project,
  });
  const loadError = toApiError(error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const setParam = (name: string, value: string | null) => {
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value === null) {
          next.delete(name);
        } else {
          next.set(name, value);
        }
        return next;
      },
      { replace: true },
    );
  };
  const chooseKind = (next: KnowledgeKindDto | null) =>
    setParam(KNOWLEDGE_SEARCH_PARAMS.kind, next);
  const chooseView = (next: KnowledgeView) =>
    setParam(
      KNOWLEDGE_SEARCH_PARAMS.view,
      next === KNOWLEDGE_VIEWS.current ? null : next,
    );
  const listState: KnowledgeListState = { listSearch: search };
  const pathOf = (key: string) =>
    knowledgeItemPath(workspace.slug, project.slug, key);
  const showStatus = !SINGLE_STATUS_VIEWS.includes(view);
  const kinds = summary?.kinds ?? [];
  const kindCounts = Object.fromEntries(
    kinds.map(entry => [entry.kind, viewCount(entry, view)]),
  ) as Partial<Record<KnowledgeKindDto, number>>;
  const viewCounts = Object.fromEntries(
    Object.values(KNOWLEDGE_VIEWS).map(option => [
      option,
      viewTotal(kinds, option, kind),
    ]),
  ) as Partial<Record<KnowledgeView, number>>;
  const shown = summary ? viewTotal(kinds, view, kind) : null;
  const groups = kinds.filter(entry => viewCount(entry, view) > 0);
  const kindTotal = kind ? (kindCounts[kind] ?? 0) : 0;
  const recordMenu = ({ wide = false } = {}) =>
    summary &&
    summary.access.canRecord.length > 0 && (
      <RecordMenu
        workspaceSlug={workspace.slug}
        projectSlug={project.slug}
        kinds={summary.access.canRecord}
        wide={wide}
      />
    );

  return (
    <KnowledgeScopeProvider scope={{ ...scope, itemPath: pathOf }}>
      <Page>
        {/* Wide: the button tops the side column instead of sitting by the title. */}
        <PageHeader
          title={t('knowledge.title')}
          description={t('knowledge.description')}
          actions={<div className='lg:hidden'>{recordMenu()}</div>}
        />
        <div className='grid gap-x-10 gap-y-6 lg:grid-cols-[12rem_minmax(0,1fr)]'>
          <aside className='sticky top-6 -mx-2 hidden max-h-[calc(100dvh-7rem)] flex-col gap-6 self-start overflow-y-auto px-2 pb-2 lg:flex'>
            {recordMenu({ wide: true })}
            <KindNav
              kind={kind}
              counts={kindCounts}
              total={summary && viewTotal(kinds, view, null)}
              onChoose={chooseKind}
            />
            <ViewNav view={view} counts={viewCounts} onChoose={chooseView} />
          </aside>
          <div className='flex min-w-0 flex-col gap-6'>
            <div className='flex flex-col gap-3 lg:hidden'>
              <Tabs
                value={view}
                onValueChange={value =>
                  chooseView(parseKnowledgeView(String(value)))
                }
                className='border-b border-border'
              >
                <TabsList
                  variant='line'
                  aria-label={t('knowledge.viewsLabel')}
                  className='-mb-px h-auto! flex-wrap justify-start gap-1'
                >
                  {Object.values(KNOWLEDGE_VIEWS).map(option => (
                    <TabsTrigger
                      key={option}
                      value={option}
                      className='h-8 flex-none'
                    >
                      {t(`knowledge.views.${option}`)}
                      {Boolean(viewCounts[option]) && (
                        <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
                          {viewCounts[option]}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <KindSelect
                className='w-full sm:w-56'
                kind={kind}
                onChoose={chooseKind}
              />
            </div>
            <div className='flex flex-col gap-6'>
              {!summary && !loadError && (
                <List>
                  <ListSkeleton rows={4} />
                </List>
              )}
              {loadError && (
                <LoadError
                  text={describeError(loadError).text}
                  onRetry={() => void refetch()}
                />
              )}
              {shown === 0 && (
                <List>
                  <ListEmpty>
                    {kind
                      ? t('knowledge.emptyKind')
                      : t(`knowledge.empty.${view}`)}
                  </ListEmpty>
                </List>
              )}
              {kind && kindTotal > 0 && (
                <div className='flex flex-col gap-3'>
                  <p className='max-w-2xl text-sm text-pretty text-muted-foreground'>
                    {t(`kindDescriptions.${kind}`)}
                  </p>
                  <KindTable kind={kind}>
                    <PagedPart
                      key={`${view}-${kind}`}
                      scope={scope}
                      view={view}
                      kind={kind}
                      total={kindTotal}
                      part={`${scope.projectId}:${view}:${kind}`}
                      active
                      rows={items => (
                        <KindTableRows
                          kind={kind}
                          items={items}
                          pathOf={pathOf}
                          state={listState}
                          showStatus={showStatus}
                        />
                      )}
                      placeholder={count => (
                        <KindTableSkeleton kind={kind} count={count} />
                      )}
                      more={line => (
                        <TableRow className='hover:bg-transparent'>
                          <TableCell
                            colSpan={columnCount(kind)}
                            className='px-2 py-1.5'
                          >
                            {line}
                          </TableCell>
                        </TableRow>
                      )}
                    />
                  </KindTable>
                </div>
              )}
              {!kind &&
                groups.map(entry => (
                  <KindGroup
                    key={`${view}-${entry.kind}`}
                    scope={scope}
                    view={view}
                    kind={entry.kind}
                    total={viewCount(entry, view)}
                    pathOf={pathOf}
                    state={listState}
                    showStatus={showStatus}
                  />
                ))}
            </div>
          </div>
        </div>
      </Page>
    </KnowledgeScopeProvider>
  );
}
