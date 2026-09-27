import { useQuery } from '@apollo/client/react';
import { getToolName, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { ArrowUpIcon, MessagesSquare, Share2, SquareIcon } from 'lucide-react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

import { AGENT_PROFILES_QUERY } from '@/entities/agent-profile';
import { useCurrentWorkspace } from '@/entities/workspace';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Bubble, BubbleContent } from '@/shared/ui/bubble';
import { Button } from '@/shared/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { Message, MessageContent } from '@/shared/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/shared/ui/message-scroller';
import { Spinner } from '@/shared/ui/spinner';
import { Textarea } from '@/shared/ui/textarea';
import { delegationToolName } from '@intentra/contracts/agents';

import { describeChatError, useAgentChat } from '../model/use-agent-chat';

type Part = UIMessage['parts'][number];

const ChatPart = ({
  part,
  agentNames,
}: {
  part: Part;
  agentNames: ReadonlyMap<string, string>;
}) => {
  if (isTextUIPart(part)) {
    return <p className='whitespace-pre-wrap'>{part.text}</p>;
  }
  if (isToolUIPart(part)) {
    const tool = getToolName(part);
    const agent = agentNames.get(tool);
    const running =
      part.state === 'input-streaming' || part.state === 'input-available';
    return (
      <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        {running ? <Spinner /> : <Share2 className='size-3' />}
        {agent ? `Delegated to ${agent}` : `Used ${tool}`}
        {part.state === 'output-error' ? ' — failed' : null}
      </p>
    );
  }
  return null;
};

const ChatMessage = ({
  message,
  agentNames,
}: {
  message: UIMessage;
  agentNames: ReadonlyMap<string, string>;
}) => {
  const mine = message.role === 'user';
  return (
    <Message align={mine ? 'end' : 'start'}>
      <MessageContent>
        <Bubble variant={mine ? 'default' : 'ghost'}>
          <BubbleContent>
            {message.parts.map((part, index) => (
              <ChatPart key={index} part={part} agentNames={agentNames} />
            ))}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
};

export const AgentChat = () => {
  const workspace = useCurrentWorkspace();
  const { messages, sendMessage, status, stop, error } = useAgentChat(
    workspace.id,
  );
  const { data } = useQuery(AGENT_PROFILES_QUERY, {
    variables: { workspaceId: workspace.id },
  });
  const [draft, setDraft] = useState('');
  const busy = status === 'submitted' || status === 'streaming';

  const agentNames = new Map(
    (data?.agentProfiles ?? []).map(profile => [
      delegationToolName(profile.id),
      profile.name,
    ]),
  );

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) send(event);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {messages.length === 0 ? (
        <Empty className='flex-1'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <MessagesSquare />
            </EmptyMedia>
            <EmptyTitle>Ask your agents</EmptyTitle>
            <EmptyDescription>
              The orchestrator answers and hands work to the other agents. The
              conversation stays in this tab only.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MessageScrollerProvider>
          <MessageScroller className='flex-1'>
            <MessageScrollerViewport>
              <MessageScrollerContent className='mx-auto w-full max-w-3xl px-4 py-6'>
                {messages.map((message, index) => (
                  <MessageScrollerItem
                    key={message.id}
                    scrollAnchor={index === messages.length - 1}
                  >
                    <ChatMessage message={message} agentNames={agentNames} />
                  </MessageScrollerItem>
                ))}
                {status === 'submitted' ? <Spinner /> : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}
      <form
        onSubmit={send}
        className='mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pb-4'
      >
        {error ? (
          <Alert variant='destructive'>
            <AlertDescription>{describeChatError(error)}</AlertDescription>
          </Alert>
        ) : null}
        <div className='flex items-end gap-2 rounded-xl border bg-background p-2'>
          <Textarea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder='Message the orchestrator…'
            aria-label='Message'
            className='max-h-40 min-h-9 resize-none border-0 shadow-none focus-visible:ring-0'
          />
          {busy ? (
            <Button
              type='button'
              size='icon-sm'
              variant='secondary'
              onClick={() => void stop()}
              aria-label='Stop'
            >
              <SquareIcon />
            </Button>
          ) : (
            <Button
              type='submit'
              size='icon-sm'
              disabled={!draft.trim()}
              aria-label='Send'
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
