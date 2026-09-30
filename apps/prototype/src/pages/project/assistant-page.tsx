import { nanoid } from '@reduxjs/toolkit';
import {
  AlertCircle,
  ArrowUp,
  Eye,
  MessageSquarePlus,
  MessageSquareText,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useSearchParams } from 'react-router';

import { useKnowledgeItemQuery } from '@/api/knowledge-api';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { InlineMarkdown, Markdown } from '@/components/markdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  conversationDeleted,
  conversationStarted,
  selectConversations,
  sendMessage,
  stopStreaming,
  type ChatMessage,
  type Conversation,
} from '@/features/chat/chat-slice';
import { ChoiceCards, readChoices } from '@/features/chat/choice-cards';
import { ThinkingStatus } from '@/features/chat/thinking-status';
import {
  isWorthShowing,
  ToolActivity,
  touchedKey,
} from '@/features/chat/tool-activity';
import { KeyLink, KindBadge, StatusBadge } from '@/features/knowledge/badges';
import { useProject } from '@/hooks/use-workspace';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

const STARTERS = [
  'Давай я опишу продукт — расспроси меня и запиши, что узнаешь.',
  'Что мы уже знаем об этом проекте?',
  'Какие открытые вопросы и пробелы стоит закрыть в первую очередь?',
  'Проверь требования на противоречия и отсутствующие критерии приёмки.',
];

/** The text of a message, as it was sent. */
function textOf(message: ChatMessage | undefined): string | null {
  if (!message) return null;
  return message.parts.map(p => (p.type === 'text' ? p.text : '')).join('');
}

function MessageView({
  message,
  streaming,
  reply,
  busy,
  onAnswer,
}: {
  message: ChatMessage;
  streaming: boolean;
  /** What the Member answered next, if they have. */
  reply: string | null;
  busy: boolean;
  onAnswer: (text: string) => void;
}) {
  if (message.role === 'user') {
    const text = message.parts
      .map(p => (p.type === 'text' ? p.text : ''))
      .join('');
    return (
      <div className='flex justify-end'>
        <div className='max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground'>
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-3'>
      <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300'>
        <Sparkles className='size-4' />
      </div>
      <div className='min-w-0 flex-1 space-y-2 pt-0.5'>
        {message.parts.map((part, index) =>
          part.type === 'text' ? (
            <Markdown key={index} size='sm'>
              {part.text}
            </Markdown>
          ) : part.toolName === 'offer_choices' ? (
            (() => {
              const choices = readChoices(part.args);
              return choices ? (
                <ChoiceCards
                  key={part.toolCallId}
                  choices={choices}
                  answer={reply}
                  disabled={busy}
                  onAnswer={onAnswer}
                />
              ) : null;
            })()
          ) : isWorthShowing(part) ? (
            <div key={part.toolCallId}>
              <ToolActivity part={part} />
            </div>
          ) : null,
        )}
        {streaming && message.parts.at(-1)?.type !== 'text' && (
          <ThinkingStatus startedAt={message.createdAt} />
        )}
        {message.error && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertTitle>Ассистент не смог ответить</AlertTitle>
            <AlertDescription>{message.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

function CapturedItem({ itemKey }: { itemKey: string }) {
  const { workspaceId, projectId } = useProject();
  const { data, isError } = useKnowledgeItemQuery({
    workspaceId,
    projectId,
    key: itemKey,
  });
  if (isError) {
    return (
      <div className='rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground'>
        <span className='font-mono'>{itemKey}</span> — удалён
      </div>
    );
  }
  return (
    <div className='space-y-1.5 rounded-lg border p-2.5'>
      <div className='flex items-center gap-1.5'>
        <KeyLink itemKey={itemKey} />
        {data && <KindBadge kind={data.kind} />}
        {data && (
          <span className='ml-auto'>
            <StatusBadge status={data.status} />
          </span>
        )}
      </div>
      <div className='text-sm font-medium'>{data?.title ?? '…'}</div>
      {data && (
        <div className='line-clamp-2 text-xs text-muted-foreground'>
          <InlineMarkdown>{data.mainField}</InlineMarkdown>
        </div>
      )}
    </div>
  );
}

function CapturedPanel({ conversation }: { conversation: Conversation }) {
  const keys = useMemo(() => {
    const seen = new Set<string>();
    for (const message of conversation.messages) {
      for (const part of message.parts) {
        if (
          part.type === 'tool' &&
          part.done &&
          !part.isError &&
          /^(record_|edit_)/.test(part.toolName)
        ) {
          const key = touchedKey(part);
          if (key) seen.add(key);
        }
      }
    }
    return [...seen];
  }, [conversation.messages]);

  return (
    <aside className='hidden w-72 shrink-0 flex-col border-l xl:flex'>
      <div className='border-b p-4'>
        <div className='text-sm font-medium'>Записано в этом разговоре</div>
        <p className='text-xs text-muted-foreground'>
          Черновики ждут утверждения сопровождающим.
        </p>
      </div>
      <ScrollArea className='min-h-0 flex-1'>
        <div className='space-y-2 p-3'>
          {keys.length ? (
            keys.map(key => <CapturedItem key={key} itemKey={key} />)
          ) : (
            <p className='p-2 text-xs text-muted-foreground'>
              Пока ничего. По ходу разговора ассистент будет записывать сюда
              требования, термины, решения и другое.
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function Composer({
  disabled,
  streaming,
  onSend,
}: {
  disabled: boolean;
  streaming: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const value = text.trim();
    if (!value || streaming || disabled) return;
    onSend(value);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  };

  useEffect(() => {
    if (!streaming) ref.current?.focus();
  }, [streaming]);

  return (
    <div className='relative rounded-2xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30'>
      <Textarea
        ref={ref}
        rows={2}
        value={text}
        disabled={disabled}
        placeholder='Расскажите ассистенту о продукте…'
        className='max-h-48 min-h-14 resize-none border-0 bg-transparent pr-14 shadow-none focus-visible:ring-0 dark:bg-transparent'
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className='absolute right-2 bottom-2'>
        {streaming ? (
          <Button
            size='icon-sm'
            variant='secondary'
            onClick={stopStreaming}
            aria-label='Остановить'
          >
            <Square className='fill-current' />
          </Button>
        ) : (
          <Button
            size='icon-sm'
            onClick={send}
            disabled={!text.trim() || disabled}
            aria-label='Отправить'
          >
            <ArrowUp />
          </Button>
        )}
      </div>
    </div>
  );
}

export function AssistantPage() {
  const { workspaceId, projectId, project, projectAccess } = useProject();
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const conversations = useAppSelector(state =>
    selectConversations(state, projectId),
  );
  const streaming = useAppSelector(state => state.chat.streaming);
  const activeId = params.get('c') ?? conversations[0]?.id ?? null;
  const conversation = conversations.find(c => c.id === activeId) ?? null;
  const isStreaming = streaming !== null;
  const bottomRef = useRef<HTMLDivElement>(null);

  const select = (id: string | null) =>
    setParams(id ? { c: id } : {}, { replace: true });

  const start = () => {
    const id = nanoid();
    dispatch(conversationStarted({ id, workspaceId, projectId }));
    select(id);
    return id;
  };

  const send = (text: string) => {
    const id = conversation?.id ?? start();
    void dispatch(sendMessage({ conversationId: id, text }));
  };

  const lastMessage = conversation?.messages.at(-1);
  const lastLength = lastMessage?.parts.reduce(
    (n, p) => n + (p.type === 'text' ? p.text.length : 1),
    0,
  );
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [conversation?.id, conversation?.messages.length, lastLength]);

  return (
    <div className='flex h-full'>
      <aside className='hidden w-60 shrink-0 flex-col border-r md:flex'>
        <div className='p-3'>
          <Button
            variant='outline'
            className='w-full justify-start'
            disabled={isStreaming}
            onClick={start}
          >
            <MessageSquarePlus /> Новый разговор
          </Button>
        </div>
        <ScrollArea className='min-h-0 flex-1'>
          <div className='space-y-0.5 px-2 pb-3'>
            {conversations.map(c => (
              <div
                key={c.id}
                className={cn(
                  'group flex items-center rounded-md hover:bg-accent',
                  c.id === activeId && 'bg-accent',
                )}
              >
                <button
                  type='button'
                  onClick={() => select(c.id)}
                  className='min-w-0 flex-1 px-2 py-1.5 text-left'
                >
                  <div className='truncate text-sm'>{c.title}</div>
                  <div className='text-xs text-muted-foreground'>
                    {formatRelative(c.updatedAt)}
                  </div>
                </button>
                <Button
                  variant='ghost'
                  size='icon-xs'
                  className='mr-1 opacity-0 group-hover:opacity-100'
                  aria-label='Удалить разговор'
                  disabled={streaming?.conversationId === c.id}
                  onClick={() => {
                    dispatch(conversationDeleted(c.id));
                    if (c.id === activeId) select(null);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className='px-2 text-xs text-muted-foreground'>
                Разговоры видите только вы; они хранятся в этом браузере.
              </p>
            )}
          </div>
        </ScrollArea>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <ScrollArea className='min-h-0 flex-1'>
          <div className='mx-auto max-w-3xl space-y-6 px-4 py-6'>
            {projectAccess?.role === 'viewer' && (
              <Alert>
                <Eye />
                <AlertTitle>В этом проекте вы читатель</AlertTitle>
                <AlertDescription>
                  Ассистент ответит на вопросы, но ничего не запишет.
                </AlertDescription>
              </Alert>
            )}
            {!conversation || conversation.messages.length === 0 ? (
              <div className='flex flex-col items-center gap-6 pt-12 text-center'>
                <div className='flex size-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-700 dark:text-violet-300'>
                  <MessageSquareText className='size-6' />
                </div>
                <div className='space-y-1'>
                  <h2 className='text-xl font-semibold tracking-tight'>
                    Поговорим о проекте {project?.name ?? ''}
                  </h2>
                  <p className='max-w-md text-sm text-muted-foreground'>
                    Ассистент расспросит вас, запишет узнанное как черновики и
                    ответит на основе того, что уже известно.
                  </p>
                </div>
                <div className='grid w-full gap-2 sm:grid-cols-2'>
                  {STARTERS.map(starter => (
                    <button
                      type='button'
                      key={starter}
                      onClick={() => send(starter)}
                      disabled={isStreaming}
                      className='rounded-xl border p-3 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50'
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              conversation.messages.map((message, index) => {
                const next = conversation.messages[index + 1];
                return (
                  <MessageView
                    key={message.id}
                    message={message}
                    streaming={streaming?.messageId === message.id}
                    reply={next?.role === 'user' ? textOf(next) : null}
                    busy={isStreaming}
                    onAnswer={send}
                  />
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        <div className='mx-auto w-full max-w-3xl px-4 pb-4'>
          <Composer disabled={false} streaming={isStreaming} onSend={send} />
          <p className='mt-1.5 text-center text-xs text-muted-foreground'>
            Enter — отправить · Shift+Enter — новая строка · Черновики
            утверждает сопровождающий
          </p>
        </div>
      </div>

      {conversation && <CapturedPanel conversation={conversation} />}
      {!conversation && (
        <aside className='hidden w-72 shrink-0 border-l xl:block' />
      )}
    </div>
  );
}
