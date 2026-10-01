import {
  BookText,
  CircleDashed,
  MessagesSquare,
  TriangleAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KNOWLEDGE_LIST_SIZE,
  KNOWLEDGE_VIEWS,
  KnowledgeScopeProvider,
  useKnowledgeItemsQuery,
  useKnowledgeSummaryQuery,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import {
  KNOWLEDGE_SEARCH_PARAMS,
  knowledgeItemPath,
  PROJECT_PAGES,
  projectPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import {
  layOutPassport,
  type PassportChapter as Chapter,
  type PassportGroup,
} from '../model/chapters';
import { useChapterInView } from '../model/use-chapter-in-view';

import { PassportChapter } from './passport-chapter';
import { PassportContents, PassportContentsFolded } from './passport-contents';
import { RecordMenu } from './record-menu';

/**
 * The Project's Passport: the product described from its Approved knowledge,
 * chapter by chapter, with the contents beside it. Drafts and items to check
 * again stay in Knowledge; the page only points to them.
 */
export function ProjectPassportPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project } = useCurrentProject(workspace?.id, workspaceAccess);
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  const skip = !workspace || !project;
  const summary = useKnowledgeSummaryQuery(scope, { skip });
  const approved = useKnowledgeItemsQuery(
    {
      ...scope,
      filter: {
        statuses: [KnowledgeStatusDtoSchema.enum.approved],
        take: KNOWLEDGE_LIST_SIZE,
      },
    },
    { skip },
  );
  const loadError = toApiError(approved.error ?? summary.error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const knowledgePath = projectPath(
    workspace.slug,
    project.slug,
    PROJECT_PAGES.knowledge,
  );
  const interviewPath = projectPath(
    workspace.slug,
    project.slug,
    PROJECT_PAGES.interview,
  );
  const viewPath = (view: KnowledgeView, kind?: KnowledgeKindDto) => {
    const params = new URLSearchParams({
      [KNOWLEDGE_SEARCH_PARAMS.view]: view,
    });
    if (kind) {
      params.set(KNOWLEDGE_SEARCH_PARAMS.kind, kind);
    }
    return `${knowledgePath}?${params.toString()}`;
  };
  const kinds = summary.data?.kinds ?? [];
  const chapters = layOutPassport(
    approved.data?.items ?? [],
    Object.fromEntries(kinds.map(kind => [kind.kind, kind.statuses.approved])),
  );
  const empty = approved.data !== undefined && approved.data.total === 0;
  const drafts = kinds.reduce((sum, kind) => sum + kind.statuses.draft, 0);
  const needsReview = kinds.reduce((sum, kind) => sum + kind.needsReview, 0);
  const canRecord = summary.data?.access.canRecord ?? [];

  return (
    <KnowledgeScopeProvider
      scope={{
        ...scope,
        itemPath: key => knowledgeItemPath(workspace.slug, project.slug, key),
      }}
    >
      <Page>
        <div className='flex flex-col gap-3'>
          <PageHeader
            title={project.name}
            actions={
              <>
                {canRecord.length > 0 && (
                  <RecordMenu
                    workspaceSlug={workspace.slug}
                    projectSlug={project.slug}
                    kinds={canRecord}
                  />
                )}
                <Button
                  render={<Link to={interviewPath} />}
                  nativeButton={false}
                >
                  <MessagesSquare />
                  {t('passport.startInterview')}
                </Button>
              </>
            }
          />
          {(drafts > 0 || needsReview > 0) && (
            <p className='flex flex-wrap gap-x-5 gap-y-1 text-sm'>
              {drafts > 0 && (
                <SignalLink to={viewPath(KNOWLEDGE_VIEWS.drafts)}>
                  <CircleDashed className='text-muted-foreground' />
                  {t('passport.drafts', { count: drafts })}
                </SignalLink>
              )}
              {needsReview > 0 && (
                <SignalLink to={viewPath(KNOWLEDGE_VIEWS.review)}>
                  <TriangleAlert className='text-warning' />
                  {t('passport.needsReview', { count: needsReview })}
                </SignalLink>
              )}
            </p>
          )}
        </div>
        {loadError ? (
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => {
              void approved.refetch();
              void summary.refetch();
            }}
          />
        ) : approved.isLoading ? (
          <PassportSkeleton />
        ) : (
          <PassportDocument
            chapters={chapters}
            empty={empty}
            interviewPath={interviewPath}
            kindPath={group => viewPath(KNOWLEDGE_VIEWS.approved, group.kind)}
          />
        )}
      </Page>
    </KnowledgeScopeProvider>
  );
}

/** The chapters, with the contents beside them or, where narrow, folded above them. */
function PassportDocument({
  chapters,
  empty,
  interviewPath,
  kindPath,
}: {
  readonly chapters: readonly Chapter[];
  readonly empty: boolean;
  readonly interviewPath: string;
  readonly kindPath: (group: PassportGroup) => string;
}) {
  const { t } = useTranslation();
  const { current, open } = useChapterInView(
    chapters.map(chapter => chapter.id),
  );

  return (
    <div className='grid gap-x-12 gap-y-8 xl:grid-cols-[minmax(0,1fr)_14rem]'>
      <div className='flex max-w-2xl min-w-0 flex-col gap-12'>
        <div className='xl:hidden'>
          <PassportContentsFolded
            chapters={chapters}
            current={current}
            open={open}
          />
        </div>
        {empty && (
          <Empty className='border border-dashed border-border'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <BookText />
              </EmptyMedia>
              <EmptyDescription>{t('passport.empty')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link to={interviewPath} />} nativeButton={false}>
                <MessagesSquare />
                {t('passport.startInterview')}
              </Button>
            </EmptyContent>
          </Empty>
        )}
        <div className='flex flex-col gap-12'>
          {chapters.map((chapter, index) => (
            <PassportChapter
              key={chapter.id}
              chapter={chapter}
              number={index + 1}
              interviewPath={empty ? null : interviewPath}
              kindPath={kindPath}
            />
          ))}
        </div>
      </div>
      <aside className='hidden xl:block'>
        <PassportContents chapters={chapters} current={current} open={open} />
      </aside>
    </div>
  );
}

function SignalLink({
  to,
  children,
}: {
  readonly to: string;
  readonly children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className='inline-flex items-center gap-1.5 rounded-sm text-foreground underline decoration-muted-foreground/50 underline-offset-[0.2em] hover:decoration-foreground [&_svg]:size-3.5 [&_svg]:shrink-0'
    >
      {children}
    </Link>
  );
}

function PassportSkeleton() {
  return (
    <div aria-busy className='flex max-w-2xl flex-col gap-8'>
      {[0, 1].map(index => (
        <div key={index} className='flex flex-col gap-3'>
          <span className='block h-4 w-40 animate-pulse rounded-md bg-muted' />
          <span className='block h-4 w-80 max-w-full animate-pulse rounded-md bg-muted' />
          <span className='block h-20 animate-pulse rounded-md bg-muted' />
        </div>
      ))}
    </div>
  );
}
