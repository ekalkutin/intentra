import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';

import {
  gapKeys,
  gapRulesOf,
  inListOrder,
  isListView,
  KindBadge,
  KNOWLEDGE_ERROR_CODES,
  KNOWLEDGE_VIEWS,
  knowledgeFilter,
  KnowledgeScopeProvider,
  KnowledgeStatusPair,
  parseKnowledgeKind,
  parseKnowledgeOrder,
  parseKnowledgeView,
  planApproval,
  readKnowledgeListState,
  useConfirmKnowledgeItemMutation,
  useKnowledgeDependenciesQuery,
  useKnowledgeGapsQuery,
  useKnowledgeIndex,
  useKnowledgeItemQuery,
  useKnowledgeItemsQuery,
  type KnowledgeListState,
} from '@/entities/knowledge-item';
import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError, type ApiError } from '@/shared/api';
import {
  KNOWLEDGE_SEARCH_PARAMS,
  knowledgeItemPath,
  PROJECT_PAGES,
  projectPath,
  ROUTE_PARAMS,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';
import {
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

import { neighboursOf } from '../model/neighbours';

import { AgentContext } from './agent-context';
import { ItemActions } from './item-actions';
import { ItemContext } from './item-context';
import { ItemFields } from './item-fields';
import { ItemGaps } from './item-gaps';
import { ItemNotices } from './item-notices';
import { ItemProperties } from './item-properties';
import { ItemStepper } from './item-stepper';

/**
 * One Knowledge Item: what it says, what it rests on, where it came from,
 * and what the person may do with it now.
 */
export function KnowledgeItemPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const key = useParams()[ROUTE_PARAMS.knowledgeKey] ?? '';
  const location = useLocation();
  const listState = readKnowledgeListState(location.state);
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project } = useCurrentProject(workspace?.id, workspaceAccess);
  const [failure, setFailure] = useState<ApiError | null>(null);
  const [confirm, { isLoading: confirming }] =
    useConfirmKnowledgeItemMutation();
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  const skip = !workspace || !project;
  const itemQuery = useKnowledgeItemQuery({ ...scope, key }, { skip });
  const item = itemQuery.currentData;
  const isDraft = item?.status === KnowledgeStatusDtoSchema.enum.draft;
  const dependsOnSomething = item?.links.some(
    link => link.type === KnowledgeLinkTypeDtoSchema.enum['depends-on'],
  );
  const dependencies = useKnowledgeDependenciesQuery(
    { ...scope, key },
    { skip: skip || !(isDraft || dependsOnSomething) },
  );
  const index = useKnowledgeIndex(scope, { skip });
  const { data: gaps } = useKnowledgeGapsQuery(scope, { skip });
  const neighbours = useNeighbours(scope, listState, key, skip);
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });
  const loadError = toApiError(itemQuery.error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const slugs = { workspaceSlug: workspace.slug, projectSlug: project.slug };
  const listPath = `${projectPath(workspace.slug, project.slug, PROJECT_PAGES.knowledge)}${listState?.listSearch ?? ''}`;
  const stepper = (
    <ItemStepper
      listPath={listPath}
      slugs={slugs}
      neighbours={neighbours}
      listState={listState}
    />
  );

  if (loadError?.code === KNOWLEDGE_ERROR_CODES.notFound) {
    return (
      <Page>
        {stepper}
        <PageHeader
          title={t('knowledgeItem.missing')}
          description={t('knowledgeItem.missingHint')}
        />
      </Page>
    );
  }
  if (loadError) {
    return (
      <Page>
        {stepper}
        <LoadError
          text={describeError(loadError).text}
          onRetry={() => void itemQuery.refetch()}
        />
      </Page>
    );
  }
  if (!item) {
    return <PageSkeleton />;
  }

  const emailOf = (memberId: string) =>
    members.find(member => member.id === memberId)?.email;
  const approval =
    isDraft && dependencies.currentData
      ? planApproval(dependencies.currentData)
      : undefined;
  const refresh = () => void itemQuery.refetch();
  const report = (error: ApiError | null) => {
    setFailure(error);
    if (error) {
      refresh();
    }
  };
  const runConfirm = async () => {
    const result = await confirm({
      ...scope,
      key: item.key,
      body: { version: item.version },
    });
    report(toApiError(result.error));
  };
  const knowledgeScope = {
    ...scope,
    itemPath: (target: string) =>
      knowledgeItemPath(workspace.slug, project.slug, target),
  };

  return (
    <KnowledgeScopeProvider scope={knowledgeScope}>
      <Page key={item.key}>
        {stepper}
        <PageHeader
          title={item.title}
          description={
            <span className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
              <KindBadge kind={item.kind} className='text-sm' />
              <span className='font-mono text-xs'>{item.key}</span>
              <KnowledgeStatusPair item={item} />
            </span>
          }
          actions={
            <>
              {item.status === KnowledgeStatusDtoSchema.enum.approved && (
                <AgentContext scope={scope} itemKey={item.key} />
              )}
              <ItemActions
                item={item}
                scope={scope}
                slugs={slugs}
                approval={approval}
                onFailure={report}
                refresh={refresh}
              />
            </>
          }
        />
        {failure && (
          <Alert variant='destructive'>
            <AlertDescription>{describeError(failure).text}</AlertDescription>
          </Alert>
        )}
        <ItemNotices
          item={item}
          confirming={confirming}
          onConfirm={() => void runConfirm()}
        />
        <ItemGaps rules={gapRulesOf(gaps?.gaps ?? [], item.key)} />
        <div className='grid gap-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-12'>
          <div className='flex min-w-0 flex-col gap-10'>
            <ItemFields item={item} />
            <ItemContext
              item={item}
              index={index}
              dependencies={dependencies.currentData}
              approval={approval}
            />
          </div>
          <aside className='min-w-0 xl:border-l xl:border-border xl:pl-8'>
            <ItemProperties item={item} emailOf={emailOf} />
          </aside>
        </div>
      </Page>
    </KnowledgeScopeProvider>
  );
}

/** Where the item stands in the list it was opened from; the list is read from the cache. */
function useNeighbours(
  scope: { readonly workspaceId: string; readonly projectId: string },
  listState: KnowledgeListState | null,
  key: string,
  skip: boolean,
) {
  const params = new URLSearchParams(listState?.listSearch ?? '');
  const view = parseKnowledgeView(params.get(KNOWLEDGE_SEARCH_PARAMS.view));
  const kind = parseKnowledgeKind(params.get(KNOWLEDGE_SEARCH_PARAMS.kind));
  const listView = isListView(view) ? view : null;
  const { data } = useKnowledgeItemsQuery(
    {
      ...scope,
      filter: knowledgeFilter(
        listView ?? KNOWLEDGE_VIEWS.all,
        kind,
        parseKnowledgeOrder(params.get(KNOWLEDGE_SEARCH_PARAMS.order)),
      ),
    },
    { skip: skip || listState === null || listView === null },
  );
  // Opened from the Gaps, it steps through the items they name.
  const { data: gaps } = useKnowledgeGapsQuery(scope, {
    skip: skip || listState === null || listView !== null,
  });
  const keys =
    listView === null
      ? gaps && gapKeys(gaps.gaps, kind)
      : data && inListOrder(data.items).map(item => item.key);

  return keys ? neighboursOf(keys, key) : null;
}
