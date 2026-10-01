import {
  EyeOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Skeleton,
} from '@/shared/ui';
import type { ConversationDto } from '@intentra/contracts/workspace';

import {
  useConversationsQuery,
  useDeleteConversationMutation,
  useEditConversationMutation,
  type InProject,
} from '../api/conversation-api';
import { whenActive } from '../model/when';

/**
 * The Member's Conversations in the Project, latest activity first, each
 * renamed, hidden or deleted from its menu; hidden ones on their own toggle.
 */
export function ConversationList({
  scope,
  activeId,
  pathOf,
  newPath,
  onNew,
  onDeleted,
  className,
}: {
  readonly scope: InProject;
  readonly activeId: string | null;
  readonly pathOf: (conversationId: string) => string;
  readonly newPath: string;
  readonly onNew: () => void;
  /** The open Conversation was deleted or hidden. */
  readonly onDeleted: (conversationId: string) => void;
  readonly className?: string;
}) {
  const { t } = useTranslation();
  const [hidden, setHidden] = useState(false);
  const { data, isLoading } = useConversationsQuery({ ...scope, hidden });
  const items = data?.items ?? [];

  return (
    <nav
      aria-label={t('interview.conversations')}
      className={cn('flex min-h-0 flex-col', className)}
    >
      <div className='flex flex-col gap-1 p-3'>
        <Button
          variant='outline'
          className='justify-start'
          render={<NavLink to={newPath} onClick={onNew} />}
          nativeButton={false}
        >
          <Plus data-icon='inline-start' />
          {t('interview.new')}
        </Button>
      </div>
      <ul className='flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3'>
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <li key={index} className='px-2 py-2'>
              <Skeleton className='h-4 w-4/5' />
            </li>
          ))
        ) : items.length === 0 ? (
          <li className='px-2 py-2 text-sm text-muted-foreground'>
            {hidden ? t('interview.noHidden') : t('interview.noConversations')}
          </li>
        ) : (
          items.map(conversation => (
            <ConversationRow
              key={conversation.id}
              scope={scope}
              conversation={conversation}
              active={conversation.id === activeId}
              to={pathOf(conversation.id)}
              onDeleted={() => onDeleted(conversation.id)}
            />
          ))
        )}
      </ul>
      <div className='border-t border-border px-3 py-2'>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start text-muted-foreground'
          onClick={() => setHidden(!hidden)}
          aria-pressed={hidden}
        >
          {hidden ? (
            <Undo2 data-icon='inline-start' />
          ) : (
            <EyeOff data-icon='inline-start' />
          )}
          {hidden ? t('interview.showShown') : t('interview.showHidden')}
        </Button>
      </div>
    </nav>
  );
}

function ConversationRow({
  scope,
  conversation,
  active,
  to,
  onDeleted,
}: {
  readonly scope: InProject;
  readonly conversation: ConversationDto;
  readonly active: boolean;
  readonly to: string;
  readonly onDeleted: () => void;
}) {
  const { t, i18n } = useTranslation();
  const describeError = useDescribeError();
  const [edit] = useEditConversationMutation();
  const [remove] = useDeleteConversationMutation();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(conversation.title ?? '');
  const [failure, setFailure] = useState<string | null>(null);
  const one = { ...scope, conversationId: conversation.id };

  const rename = async () => {
    setRenaming(false);
    const next = title.trim();
    if (next === '' || next === conversation.title) {
      setTitle(conversation.title ?? '');
      return;
    }
    await edit({ ...one, body: { title: next } });
  };
  const onRenameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void rename();
    }
    if (event.key === 'Escape') {
      setTitle(conversation.title ?? '');
      setRenaming(false);
    }
  };
  const toggleHidden = async () => {
    const result = await edit({
      ...one,
      body: { hidden: !conversation.hidden },
    });
    if (!result.error && !conversation.hidden) {
      onDeleted();
    }
  };
  const onDelete = async () => {
    const result = await remove(one);
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
    if (!error) {
      onDeleted();
    }
    return !error;
  };

  if (renaming) {
    return (
      <li className='py-0.5'>
        <Input
          autoFocus
          value={title}
          maxLength={200}
          onChange={event => setTitle(event.target.value)}
          onKeyDown={onRenameKey}
          onBlur={() => void rename()}
          aria-label={t('interview.renameLabel')}
          className='h-8'
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        'group/row relative flex items-center gap-1 rounded-md transition-colors hover:bg-accent/60',
        active && 'bg-accent hover:bg-accent',
      )}
    >
      <NavLink
        to={to}
        className='flex min-w-0 flex-1 items-baseline gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate',
            active && 'font-medium',
            !conversation.title && 'text-muted-foreground',
          )}
        >
          {conversation.title ?? t('interview.untitled')}
        </span>
        <span className='shrink-0 font-mono text-xs text-muted-foreground tabular-nums group-hover/row:invisible group-has-[[data-popup-open]]/row:invisible'>
          {whenActive(conversation.updatedAt, i18n.language)}
        </span>
      </NavLink>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              size='icon-xs'
              className='absolute right-1 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100'
              aria-label={t('interview.actions')}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-44'>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              <Pencil />
              {t('interview.rename')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void toggleHidden()}>
              {conversation.hidden ? <Undo2 /> : <EyeOff />}
              {conversation.hidden
                ? t('interview.unhide')
                : t('interview.hide')}
            </DropdownMenuItem>
            <ConfirmDialog
              trigger={
                <DropdownMenuItem variant='destructive' closeOnClick={false}>
                  <Trash2 />
                  {t('interview.delete')}
                </DropdownMenuItem>
              }
              title={t('interview.deleteTitle')}
              description={t('interview.deleteDescription')}
              confirmLabel={t('interview.delete')}
              error={failure}
              onConfirm={onDelete}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
