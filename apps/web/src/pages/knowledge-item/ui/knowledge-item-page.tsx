import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';

import {
  gapRulesOf,
  KindBadge,
  KNOWLEDGE_ERROR_CODES,
  KnowledgeScopeProvider,
  KnowledgeStatusPair,
  planApproval,
  readKnowledgeListState,
  useConfirmKnowledgeItemMutation,
  useKnowledgeDependenciesQuery,
  useKnowledgeGapsQuery,
  useKnowledgeIndex,
  useKnowledgeItemQuery,
} from '@/entities/knowledge-item';
import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError, type ApiError } from '@/shared/api';
import {
  conversationPath,
  knowledgeItemPath,
  PROJECT_PAGES,
  projectPath,
  ROUTE_PARAMS,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { RESTORE_SCROLL_STATE } from '@/shared/lib';
import {
  Alert,
  AlertDescription,
  BackLink,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

import { proposedAnswers } from '../model/links';

import { AgentContext } from './agent-context';
import { FeatureParts } from './feature-parts';
import { ItemActions } from './item-actions';
import { ItemContext } from './item-context';
import { ItemFields } from './item-fields';
import { ItemGaps } from './item-gaps';
import { ItemNotices } from './item-notices';
import { ItemProperties } from './item-properties';

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
  const isFeature = item?.kind === KnowledgeKindDtoSchema.enum.feature;
  const { data: gaps } = useKnowledgeGapsQuery(scope, { skip });
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });
  const loadError = toApiError(itemQuery.error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const slugs = { workspaceSlug: workspace.slug, projectSlug: project.slug };
  const listPath = `${projectPath(workspace.slug, project.slug, PROJECT_PAGES.knowledge)}${listState?.listSearch ?? ''}`;
  // Back to the list as it was left: its view, Kind and order, and its scroll.
  const stepper = (
    <BackLink
      to={listPath}
      label={t('knowledgeItem.back')}
      state={RESTORE_SCROLL_STATE}
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

  // A Member by name, or by email when they have none.
  const nameOf = (memberId: string) => {
    const member = members.find(candidate => candidate.id === memberId);
    return member && (member.name || member.email);
  };
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
        {/*
          From 1280px the title is a band across the page, and under it two
          columns start on one line: the content on the left (what is open
          about the item, its fields, its Links) and, 3rem on with no rule, what can
          be done with it and what it is (the actions, then where it came from
          and its history). Narrower, in reading order: title, actions,
          content, then the rest.
        */}
        <div className='grid gap-y-6 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-x-12 xl:gap-y-8'>
          <div className='min-w-0 max-xl:order-1 xl:col-span-2 xl:row-start-1'>
            <PageHeader
              title={item.title}
              description={
                <span className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
                  <KindBadge kind={item.kind} className='text-sm' />
                  <span className='font-mono text-xs'>{item.key}</span>
                  <KnowledgeStatusPair item={item} />
                </span>
              }
            />
          </div>
          {/* One unbroken column from 1280px; narrower its parts take their place in reading order. */}
          <div className='max-xl:contents xl:col-start-2 xl:row-start-2 xl:flex xl:flex-col xl:gap-8'>
            <div className='flex flex-wrap items-center gap-2 max-xl:order-2'>
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
            </div>
            <aside className='min-w-0 max-xl:order-4 max-xl:mt-4'>
              <ItemProperties item={item} nameOf={nameOf} />
            </aside>
          </div>
          <div className='flex min-w-0 flex-col gap-8 max-xl:order-3 xl:col-start-1 xl:row-start-2'>
            {failure && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {describeError(failure).text}
                </AlertDescription>
              </Alert>
            )}
            <ItemNotices
              item={item}
              approval={approval}
              editPath={
                isDraft && item.access.canEdit
                  ? knowledgeItemPath(workspace.slug, project.slug, item.key, {
                      edit: true,
                    })
                  : undefined
              }
              confirming={confirming}
              onConfirm={() => void runConfirm()}
            />
            <ItemGaps
              item={item}
              rules={gapRulesOf(gaps?.gaps ?? [], item.key)}
              proposed={proposedAnswers(item.key, index.items)}
              interviewPath={conversationPath(workspace.slug, project.slug)}
            />
            <div className='flex min-w-0 flex-col gap-10'>
              <ItemFields item={item} />
              {isFeature && (
                <FeatureParts feature={item} index={index} scope={scope} />
              )}
              <ItemContext
                item={item}
                index={index}
                dependencies={dependencies.currentData}
              />
            </div>
          </div>
        </div>
      </Page>
    </KnowledgeScopeProvider>
  );
}
