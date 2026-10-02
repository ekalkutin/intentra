import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import {
  gapRulesOf,
  groupGapsByRule,
  isListView,
  KNOWLEDGE_VIEWS,
  KnowledgeScopeProvider,
  parseKnowledgeKind,
  parseKnowledgeOrder,
  parseKnowledgeView,
  useKnowledgeGapsQuery,
  useKnowledgeIndex,
  useKnowledgeSummaryQuery,
  viewCount,
  viewTotal,
  type KnowledgeListState,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import {
  KNOWLEDGE_SEARCH_PARAMS,
  knowledgeItemPath,
  newKnowledgeItemPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  List,
  ListEmpty,
  ListSkeleton,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
  TableCell,
  TableRow,
} from '@/shared/ui';
import {
  KnowledgeListOrderDtoSchema,
  type KnowledgeKindDto,
  type KnowledgeListOrderDto,
} from '@intentra/contracts/workspace';

import { openQuestionsByKey } from '../model/open-questions';

import { ApproveAll } from './approve-all';
import { GapsView } from './gaps-view';
import { ItemSignalsProvider } from './item-signals';
import { KindGroup } from './kind-group';
import {
  columnCount,
  KindTable,
  KindTableRows,
  KindTableSkeleton,
} from './kind-table';
import { KnowledgeFilters } from './knowledge-filters';
import { PagedPart } from './paged-part';

/** Views where every item has the same status, so rows need not repeat it. */
const SINGLE_STATUS_VIEWS: readonly KnowledgeView[] = [
  KNOWLEDGE_VIEWS.approved,
  KNOWLEDGE_VIEWS.drafts,
  KNOWLEDGE_VIEWS.rejected,
  KNOWLEDGE_VIEWS.obsolete,
];

/**
 * A Project's knowledge: a status view (every item, Approved, Drafts, Needs
 * Review, Rejected, Obsolete; none overlaps another but the first) or the
 * Gaps, and a Kind, chosen above the list. Every count comes from the
 * Project's summary and its Gaps; every Kind is a group read a page at a time
 * once it comes near the screen, or one Kind is a table of its fields. The
 * Gaps are grouped by what they miss.
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
  const order = parseKnowledgeOrder(params.get(KNOWLEDGE_SEARCH_PARAMS.order));
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
  const { data: gapsData } = useKnowledgeGapsQuery(scope, {
    skip: !workspace || !project,
  });
  const gaps = gapsData?.gaps ?? [];
  const index = useKnowledgeIndex(scope, { skip: !workspace || !project });
  const questions = useMemo(
    () => openQuestionsByKey(index.items),
    [index.items],
  );
  const signals = useMemo(
    () => ({
      gapsOf: (key: string) => gapRulesOf(gaps, key),
      questionsOf: (key: string) => questions.get(key) ?? [],
    }),
    [gaps, questions],
  );
  const loadError = toApiError(error);
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });

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
      next === KNOWLEDGE_VIEWS.all ? null : next,
    );
  const chooseOrder = (next: KnowledgeListOrderDto) =>
    setParam(
      KNOWLEDGE_SEARCH_PARAMS.order,
      next === KnowledgeListOrderDtoSchema.enum['by-key'] ? null : next,
    );
  const listState: KnowledgeListState = { listSearch: search };
  const pathOf = (key: string) =>
    knowledgeItemPath(workspace.slug, project.slug, key);
  const showStatus = !SINGLE_STATUS_VIEWS.includes(view);
  const kinds = summary?.kinds ?? [];
  const kindCounts = Object.fromEntries(
    kinds.map(entry => [entry.kind, viewCount(entry, view, gaps)]),
  ) as Partial<Record<KnowledgeKindDto, number>>;
  const viewCounts = Object.fromEntries(
    Object.values(KNOWLEDGE_VIEWS).map(option => [
      option,
      viewTotal(kinds, option, kind, gaps),
    ]),
  ) as Partial<Record<KnowledgeView, number>>;
  const loaded = summary && (isListView(view) || gapsData);
  const shown = loaded ? viewTotal(kinds, view, kind, gaps) : null;
  const groups = kinds.filter(entry => viewCount(entry, view, gaps) > 0);
  const kindTotal = kind ? (kindCounts[kind] ?? 0) : 0;
  const memberOf = (memberId: string) =>
    members.find(member => member.id === memberId);
  // Where the chosen Kind (or anything at all) is, when this view holds none of it.
  const elsewhere = Object.values(KNOWLEDGE_VIEWS).filter(
    option => option !== view && (viewCounts[option] ?? 0) > 0,
  );
  const otherKinds = kind ? viewTotal(kinds, view, null, gaps) : 0;

  return (
    <KnowledgeScopeProvider scope={{ ...scope, itemPath: pathOf }}>
      <ItemSignalsProvider value={signals}>
        <Page>
          <PageHeader
            title={t('knowledge.title')}
            description={t('knowledge.description')}
            // What the Drafts view offers to do with all it lists.
            actions={
              view === KNOWLEDGE_VIEWS.drafts &&
              shown !== null &&
              shown > 0 && (
                <ApproveAll scope={scope} kind={kind} count={shown} />
              )
            }
          />
          <div className='flex min-w-0 flex-col gap-6'>
            <KnowledgeFilters
              view={view}
              viewCounts={viewCounts}
              kind={kind}
              kindCounts={kindCounts}
              total={summary && viewTotal(kinds, view, null, gaps)}
              order={order}
              onView={chooseView}
              onKind={chooseKind}
              onOrder={chooseOrder}
            />
            <div className='flex flex-col gap-6'>
              {!loaded && !loadError && (
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
                  <ListEmpty
                    action={
                      (elsewhere.length > 0 || otherKinds > 0) && (
                        <span className='flex flex-wrap gap-2'>
                          {elsewhere.map(option => (
                            <Button
                              key={option}
                              variant='outline'
                              size='sm'
                              onClick={() => chooseView(option)}
                            >
                              {t(`knowledge.views.${option}`)}
                              <span className='font-mono text-xs text-muted-foreground tabular-nums'>
                                {viewCounts[option]}
                              </span>
                            </Button>
                          ))}
                          {otherKinds > 0 && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => chooseKind(null)}
                            >
                              {t('knowledge.allKinds')}
                              <span className='font-mono text-xs text-muted-foreground tabular-nums'>
                                {otherKinds}
                              </span>
                            </Button>
                          )}
                        </span>
                      )
                    }
                  >
                    {kind
                      ? t('knowledge.emptyKind')
                      : t(`knowledge.empty.${view}`)}
                  </ListEmpty>
                </List>
              )}
              {view === KNOWLEDGE_VIEWS.gaps && (
                <GapsView
                  groups={groupGapsByRule(gaps, kind)}
                  pathOf={pathOf}
                  newPathOf={next =>
                    newKnowledgeItemPath(workspace.slug, project.slug, next)
                  }
                  canRecord={summary?.access.canRecord ?? []}
                  state={listState}
                />
              )}
              {isListView(view) && kind && kindTotal > 0 && (
                <div className='flex flex-col gap-3'>
                  <p className='max-w-2xl text-sm text-pretty text-muted-foreground'>
                    {t(`kindDescriptions.${kind}`)}
                  </p>
                  <KindTable kind={kind}>
                    <PagedPart
                      key={`${view}-${kind}-${order}`}
                      scope={scope}
                      view={view}
                      kind={kind}
                      order={order}
                      total={kindTotal}
                      part={`${scope.projectId}:${view}:${kind}:${order}`}
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
              {isListView(view) &&
                !kind &&
                groups.map(entry => (
                  <KindGroup
                    key={`${view}-${entry.kind}-${order}`}
                    scope={scope}
                    view={view}
                    kind={entry.kind}
                    order={order}
                    total={viewCount(entry, view, gaps)}
                    pathOf={pathOf}
                    state={listState}
                    memberOf={memberOf}
                  />
                ))}
            </div>
          </div>
        </Page>
      </ItemSignalsProvider>
    </KnowledgeScopeProvider>
  );
}
