import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import {
  API_TAGS,
  baseApi,
  sessionFetch,
  toStreamApiError,
} from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Bubble,
  BubbleContent,
  Button,
  Message,
  MessageContent,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/shared/ui';
import type { SendMessageDto } from '@intentra/contracts/workspace';

import { messagesUrl } from '../api/conversation-api';
import { CONVERSATION_ERROR_CODES } from '../model/error-codes';
import { readMessage, textOf } from '../model/message-parts';

import { AssistantMessage } from './assistant-message';
import { Composer } from './composer';
import { EmptyChat } from './empty-chat';

/**
 * A row paints only inside its box (`content-visibility`), so a focus ring on
 * its edge would be cut: it reaches 4px past the column on each side.
 */
const ITEM_CLASS = '-mx-1 px-1';

const STARTED = 'submitted';
const STREAMING = 'streaming';

/**
 * One Conversation, live: the transcript follows the answer as it streams,
 * the composer stays at the bottom. The first message of a new Conversation
 * creates it under the id chosen here.
 */
export function Chat({
  workspaceId,
  projectId,
  conversationId,
  initialMessages,
  projectName,
  notice,
  opening = null,
  onFirstMessage,
  onMessages,
}: {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly conversationId: string;
  readonly initialMessages: readonly UIMessage[];
  readonly projectName: string;
  /** A note above the composer, such as a Viewer's. */
  readonly notice?: string;
  /** A first message to send at once, for a new Conversation opened from a link. */
  readonly opening?: string | null;
  /** Called once a new Conversation got its first message. */
  readonly onFirstMessage: () => void;
  /** The transcript as it changes, for what the page shows beside it. */
  readonly onMessages: (messages: readonly UIMessage[]) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const describeError = useDescribeError();
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: messagesUrl({ workspaceId, projectId, conversationId }),
        fetch: sessionFetch,
        // The server keeps the history: it takes only the new message.
        prepareSendMessagesRequest: ({ messages }) => {
          const last = messages.at(-1);
          const body: SendMessageDto = {
            message: {
              id: last?.id,
              role: 'user',
              parts: [{ type: 'text', text: last ? textOf(last) : '' }],
            },
          };
          return { body };
        },
      }),
    [workspaceId, projectId, conversationId],
  );
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    id: conversationId,
    messages: initialMessages as UIMessage[],
    transport,
    experimental_throttle: 50,
    onData: part => {
      if (part.type === 'data-thread-title') {
        dispatch(baseApi.util.invalidateTags([API_TAGS.conversation]));
      }
    },
    onFinish: () => {
      dispatch(
        baseApi.util.invalidateTags([
          API_TAGS.conversation,
          API_TAGS.knowledge,
        ]),
      );
    },
  });
  const busy = status === STARTED || status === STREAMING;
  const failure = toStreamApiError(error);

  useEffect(() => onMessages(messages), [messages, onMessages]);

  const send = (text: string) => {
    if (messages.length === 0) {
      onFirstMessage();
    }
    void sendMessage({ text });
  };

  // The link's first message goes out once, even when effects run twice.
  const openingSent = useRef(false);
  useEffect(() => {
    if (opening && !openingSent.current && messages.length === 0) {
      openingSent.current = true;
      send(opening);
    }
    // Only a new Conversation's first render may send it, so nothing else re-runs this.
  }, [opening]);

  /** Each choice card's reply: the Member's next message, if any. */
  const answers = useMemo(() => {
    const replies = new Map<string, string>();
    messages.forEach((message, index) => {
      if (message.role !== 'assistant') {
        return;
      }
      const next = messages[index + 1];
      for (const block of readMessage(message).blocks) {
        if (block.type === 'choices' && next?.role === 'user') {
          replies.set(block.id, textOf(next));
        }
      }
    });
    return replies;
  }, [messages]);

  const last = messages.at(-1);
  const waiting = busy && last?.role === 'user';

  const turns = messages.filter(message => message.role === 'user').length;
  const readingBack = useRef(false);

  return (
    // Keeps to the bottom edge and follows the answer; scrolling up stops it.
    <MessageScrollerProvider autoScroll defaultScrollPosition='end'>
      <div className='flex min-h-0 flex-1 flex-col'>
        <FollowTurns turns={turns} busy={busy} readingBack={readingBack} />
        <MessageScroller className='flex-1'>
          <MessageScrollerViewport
            onWheel={event => {
              if (event.deltaY < 0) {
                readingBack.current = true;
              }
            }}
            onTouchMove={() => {
              readingBack.current = true;
            }}
          >
            <MessageScrollerContent className='mx-auto w-full max-w-3xl gap-8 px-4 pt-8 pb-6 md:px-8'>
              {messages.length === 0 ? (
                <MessageScrollerItem messageId='empty' className={ITEM_CLASS}>
                  <EmptyChat projectName={projectName} onStart={send} />
                </MessageScrollerItem>
              ) : (
                messages.map(message => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    className={ITEM_CLASS}
                  >
                    {message.role === 'user' ? (
                      <Message align='end'>
                        <MessageContent>
                          <Bubble variant='muted' align='end'>
                            <BubbleContent className='whitespace-pre-wrap'>
                              {textOf(message)}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    ) : (
                      <AssistantMessage
                        message={message}
                        streaming={busy && message === last}
                        answers={answers}
                        canAnswer={!busy}
                        onAnswer={send}
                      />
                    )}
                  </MessageScrollerItem>
                ))
              )}
              {waiting && (
                <MessageScrollerItem messageId='waiting' className={ITEM_CLASS}>
                  <AssistantMessage
                    message={{ id: 'waiting', role: 'assistant', parts: [] }}
                    streaming
                    answers={answers}
                    canAnswer={false}
                    onAnswer={send}
                  />
                </MessageScrollerItem>
              )}
              {failure && !busy && (
                <MessageScrollerItem messageId='error' className={ITEM_CLASS}>
                  <Alert variant='destructive'>
                    <AlertTitle>{t('interview.failed')}</AlertTitle>
                    <AlertDescription>
                      {failure.code === CONVERSATION_ERROR_CODES.busy
                        ? t('interview.busy')
                        : describeError(failure).text}
                    </AlertDescription>
                    <AlertAction>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => void regenerate()}
                      >
                        <RotateCcw data-icon='inline-start' />
                        {t('interview.retry')}
                      </Button>
                    </AlertAction>
                  </Alert>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        {/* The transcript's scrollbar gutter, kept here too, so the composer shares its edges; pt-1 keeps the focus ring inside the clip. */}
        <div className='[scrollbar-gutter:stable] [scrollbar-width:thin] overflow-y-hidden'>
          <div className='mx-auto w-full max-w-3xl px-4 pt-1 pb-4 md:px-8'>
            {notice && (
              <p className='mb-2 text-xs text-pretty text-muted-foreground'>
                {notice}
              </p>
            )}
            <Composer busy={busy} onSend={send} onStop={() => void stop()} />
          </div>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

/**
 * Brings the end of the transcript into view when the Member sends a message,
 * and once an answer is in unless they scrolled back to read meanwhile: an
 * answer can end with a tall block (choice cards) that outruns the follow.
 */
function FollowTurns({
  turns,
  busy,
  readingBack,
}: {
  readonly turns: number;
  readonly busy: boolean;
  readonly readingBack: { current: boolean };
}) {
  const { scrollToEnd } = useMessageScroller();
  const wasBusy = useRef(busy);

  useEffect(() => {
    if (turns > 0) {
      readingBack.current = false;
      scrollToEnd({ behavior: 'smooth' });
    }
  }, [turns, scrollToEnd, readingBack]);

  useEffect(() => {
    if (wasBusy.current && !busy && !readingBack.current) {
      // After the last block has laid out.
      requestAnimationFrame(() => scrollToEnd({ behavior: 'smooth' }));
    }
    wasBusy.current = busy;
  }, [busy, scrollToEnd, readingBack]);

  return null;
}
