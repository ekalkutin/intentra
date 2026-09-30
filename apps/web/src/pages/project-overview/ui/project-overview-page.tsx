import { MessagesSquare, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useMembersQuery } from '@/entities/member';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { PROJECT_PAGES, projectPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  LoadError,
  Page,
  PageHeader,
  PageSection,
  PageSkeleton,
} from '@/shared/ui';
import { KnowledgeStatusDtoSchema } from '@intentra/contracts/workspace';

import { useKnowledgeItemsQuery } from '../api/knowledge-api';
import { summarizeKnowledge } from '../model/summary';

import { AwaitingApproval } from './awaiting-approval';
import { Contents } from './contents';

/** The most items one request reads; a larger Project is counted in part. */
const COUNTED = 200;

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
  const knowledge = useKnowledgeItemsQuery(
    {
      ...scope,
      filter: {
        statuses: [
          KnowledgeStatusDtoSchema.enum.draft,
          KnowledgeStatusDtoSchema.enum.approved,
        ],
        take: COUNTED,
      },
    },
    { skip },
  );
  const needsReview = useKnowledgeItemsQuery(
    { ...scope, filter: { needsReview: true, take: 1 } },
    { skip },
  );
  const { data: members = [] } = useMembersQuery(workspace?.id ?? '', {
    skip: !workspace,
  });
  const loadError = toApiError(knowledge.error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const summary = summarizeKnowledge(knowledge.data?.items ?? []);
  const total = knowledge.data?.total ?? 0;
  const reviewCount = needsReview.data?.total ?? 0;
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
          <TriangleAlert className='text-warning' />
          <AlertDescription className='text-foreground'>
            {t('overview.needsReview', { count: reviewCount })}
          </AlertDescription>
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
              <Contents kinds={summary.kinds} />
              {total > COUNTED && (
                <p className='text-xs text-muted-foreground'>
                  {t('overview.truncated', { shown: COUNTED, total })}
                </p>
              )}
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
              />
            </PageSection>
          </div>
        </>
      )}
    </Page>
  );
}
