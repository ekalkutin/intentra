import { MessagesSquare, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KNOWLEDGE_VIEWS,
  useKnowledgeItemsQuery,
  useKnowledgeSummaryQuery,
} from '@/entities/knowledge-item';
import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import {
  KNOWLEDGE_SEARCH_PARAMS,
  PROJECT_PAGES,
  projectPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertAction,
  AlertDescription,
  Button,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';
import {
  KnowledgeListOrderDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

import { summarizeKnowledge } from '../model/summary';

import { AWAITING_SHOWN, AwaitingApproval } from './awaiting-approval';
import { Contents } from './contents';

/**
 * The Project's table of contents: what is signed by Kind, what waits for a
 * signature, and what needs checking again.
 */
export function ProjectOverviewPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project, access } = useCurrentProject(workspace?.id, workspaceAccess);
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  const skip = !workspace || !project;
  const knowledge = useKnowledgeSummaryQuery(scope, { skip });
  // The newest Drafts, as the server orders them; the counts come from the summary.
  const drafts = useKnowledgeItemsQuery(
    {
      ...scope,
      filter: {
        statuses: [KnowledgeStatusDtoSchema.enum.draft],
        order: KnowledgeListOrderDtoSchema.enum['newest-first'],
        take: AWAITING_SHOWN,
      },
    },
    { skip },
  );
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });
  const loadError = toApiError(knowledge.error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const summary = summarizeKnowledge(
    knowledge.data?.kinds ?? [],
    drafts.data?.items ?? [],
  );
  const total = summary.approved + summary.drafts;
  const reviewCount = summary.needsReview;
  const emailOf = (memberId: string) =>
    members.find(member => member.id === memberId)?.email;

  return (
    <Page>
      <PageHeader
        title={project.name}
        description={
          access && (
            <>
              {t('projects.yourAccess', {
                role: t(`projectRoles.${access.role}`).toLowerCase(),
              })}
            </>
          )
        }
        actions={
          <Button
            render={
              <Link
                to={projectPath(
                  workspace.slug,
                  project.slug,
                  PROJECT_PAGES.interview,
                )}
              />
            }
            nativeButton={false}
          >
            <MessagesSquare />
            {t('overview.startInterview')}
          </Button>
        }
      />
      {reviewCount > 0 && (
        <Alert>
          <TriangleAlert className='text-warning!' />
          <AlertDescription className='text-foreground'>
            {t('overview.needsReview', { count: reviewCount })}
          </AlertDescription>
          <AlertAction>
            <Button
              variant='outline'
              size='sm'
              render={
                <Link
                  to={`${projectPath(workspace.slug, project.slug, PROJECT_PAGES.knowledge)}?${KNOWLEDGE_SEARCH_PARAMS.view}=${KNOWLEDGE_VIEWS.review}`}
                />
              }
              nativeButton={false}
            >
              {t('overview.openReview')}
            </Button>
          </AlertAction>
        </Alert>
      )}
      {loadError ? (
        <LoadError
          text={describeError(loadError).text}
          onRetry={() => void knowledge.refetch()}
        />
      ) : (
        <>
          {!knowledge.isLoading && total === 0 && (
            <p className='max-w-2xl text-sm text-pretty text-muted-foreground'>
              {t('overview.empty')}
            </p>
          )}
          <div
            aria-busy={knowledge.isLoading}
            className='grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'
          >
            <PageSection
              title={t('overview.contents')}
              description={t('overview.contentsDescription')}
            >
              <Contents
                kinds={summary.kinds}
                workspaceSlug={workspace.slug}
                projectSlug={project.slug}
              />
            </PageSection>
            <PageSection
              title={
                <>
                  {t('overview.awaiting')}
                  {summary.drafts > 0 && (
                    <span className='ml-2 font-mono font-normal text-muted-foreground'>
                      {summary.drafts}
                    </span>
                  )}
                </>
              }
              description={t('overview.awaitingDescription')}
            >
              <AwaitingApproval
                drafts={summary.awaitingApproval}
                emailOf={emailOf}
                workspaceSlug={workspace.slug}
                projectSlug={project.slug}
              />
            </PageSection>
          </div>
        </>
      )}
    </Page>
  );
}
