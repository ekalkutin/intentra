import type { UIMessage } from 'ai';
import { MessagesSquare } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { KnowledgeScopeProvider } from '@/entities/knowledge-item';
import { useCurrentProject } from '@/entities/project';
import { useMeQuery } from '@/entities/session';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import {
  conversationPath,
  knowledgeItemPath,
  ROUTE_PARAMS,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Badge,
  Button,
  LoadError,
  PageSkeleton,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import { ProjectRoleDtoSchema } from '@intentra/contracts/workspace';

import {
  useConversationQuery,
  useConversationsQuery,
} from '../api/conversation-api';
import { CONVERSATION_ERROR_CODES } from '../model/error-codes';
import { capturedKeys } from '../model/message-parts';

import { CapturedPanel } from './captured-panel';
import { Chat } from './chat';
import { ConversationList } from './conversation-list';

const NO_MESSAGES: readonly UIMessage[] = [];

/**
 * A Project's interview: the Member's Conversations on the left, the open one
 * in the middle, what it recorded on the right. `…/interview` starts a new
 * Conversation under an id chosen here; its first message creates it.
 */
export function ProjectInterviewPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const paramId = useParams()[ROUTE_PARAMS.conversationId] ?? null;
  const { workspace, access } = useCurrentWorkspace();
  const { project, access: projectAccess } = useCurrentProject(
    workspace?.id,
    access,
  );
  const { data: me } = useMeQuery();
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const previousId = useRef(paramId);
  const [listOpen, setListOpen] = useState(false);
  const [transcript, setTranscript] =
    useState<readonly UIMessage[]>(NO_MESSAGES);
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  // The Conversation begun here keeps its chat when the address catches up.
  const startedHere = paramId !== null && paramId === draftId;
  const chatId = paramId ?? draftId;
  const loaded = useConversationQuery(
    { ...scope, conversationId: paramId ?? '' },
    {
      skip: !workspace || !project || paramId === null || startedHere,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: list } = useConversationsQuery(
    { ...scope, hidden: false },
    { skip: !workspace || !project },
  );
  const loadError = toApiError(loaded.error);

  // Left a Conversation for `…/interview`: a new one starts under a new id.
  useEffect(() => {
    if (previousId.current !== null && paramId === null) {
      setDraftId(crypto.randomUUID());
    }
    previousId.current = paramId;
  }, [paramId]);

  const onMessages = useCallback(
    (messages: readonly UIMessage[]) => setTranscript(messages),
    [],
  );
  const keys = useMemo(() => capturedKeys(transcript), [transcript]);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const pathOf = (id?: string) =>
    conversationPath(workspace.slug, project.slug, id);
  const knowledgeScope = {
    ...scope,
    itemPath: (key: string) =>
      knowledgeItemPath(workspace.slug, project.slug, key),
  };
  const listed = list?.items.find(conversation => conversation.id === chatId);
  // A Conversation gets its title from the agent after the first answer.
  const title = listed
    ? (listed.title ?? t('interview.untitled'))
    : startedHere || paramId === null
      ? t('interview.new')
      : (loaded.currentData?.title ?? t('interview.untitled'));
  const viewer = projectAccess?.role === ProjectRoleDtoSchema.enum.viewer;

  const listColumn = (className?: string) => (
    <ConversationList
      scope={scope}
      activeId={paramId}
      pathOf={pathOf}
      newPath={pathOf()}
      onNew={() => setListOpen(false)}
      onDeleted={id => {
        if (id === paramId) {
          void navigate(pathOf(), { replace: true });
        }
      }}
      className={className}
    />
  );

  const chat = () => {
    if (paramId !== null && !startedHere) {
      if (loadError) {
        return loadError.code === CONVERSATION_ERROR_CODES.notFound ? (
          <div className='mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 pt-8 md:px-8'>
            <h2 className='text-sm font-semibold'>{t('interview.missing')}</h2>
            <p className='text-sm text-muted-foreground'>
              {t('interview.missingHint')}
            </p>
          </div>
        ) : (
          <div className='mx-auto w-full max-w-3xl px-4 pt-8 md:px-8'>
            <LoadError
              text={describeError(loadError).text}
              onRetry={() => void loaded.refetch()}
            />
          </div>
        );
      }
      if (!loaded.currentData) {
        return <PageSkeleton />;
      }
    }

    return (
      <Chat
        key={chatId}
        workspaceId={workspace.id}
        projectId={project.id}
        conversationId={chatId}
        initialMessages={
          paramId !== null && !startedHere
            ? (loaded.currentData?.messages ?? NO_MESSAGES)
            : NO_MESSAGES
        }
        projectName={project.name}
        notice={viewer ? t('interview.viewer') : undefined}
        onFirstMessage={() => {
          if (paramId === null) {
            void navigate(pathOf(chatId));
          }
        }}
        onMessages={onMessages}
      />
    );
  };

  return (
    <KnowledgeScopeProvider scope={knowledgeScope}>
      <div className='flex h-full min-h-0'>
        {listColumn('hidden w-64 shrink-0 border-r border-border md:flex')}
        <section className='flex min-w-0 flex-1 flex-col'>
          <header className='flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 md:px-4'>
            <Sheet open={listOpen} onOpenChange={setListOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    className='md:hidden'
                    aria-label={t('interview.conversations')}
                  />
                }
              >
                <MessagesSquare />
              </SheetTrigger>
              <SheetContent
                side='left'
                showCloseButton={false}
                className='w-72 p-0'
              >
                <SheetHeader className='sr-only'>
                  <SheetTitle>{t('interview.conversations')}</SheetTitle>
                  <SheetDescription>{t('interview.title')}</SheetDescription>
                </SheetHeader>
                {listColumn('h-full')}
              </SheetContent>
            </Sheet>
            <h1 className='min-w-0 flex-1 truncate text-sm font-medium'>
              {title}
            </h1>
            {me?.isPlatformAdmin && (
              <Tooltip>
                <TooltipTrigger render={<Badge variant='outline' />}>
                  {t('interview.unpublished')}
                </TooltipTrigger>
                <TooltipContent>
                  {t('interview.unpublishedHint')}
                </TooltipContent>
              </Tooltip>
            )}
          </header>
          {chat()}
        </section>
        <CapturedPanel keys={keys} />
      </div>
    </KnowledgeScopeProvider>
  );
}
