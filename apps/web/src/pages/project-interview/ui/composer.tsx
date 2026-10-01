import { ArrowUp, Square } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/shared/ui';

/** The server's limit on one message. */
const MESSAGE_MAX = 20_000;

/**
 * Where the Member writes: Enter sends, Shift+Enter breaks the line; while
 * the agent answers, the send button stops it instead.
 */
export function Composer({
  busy,
  disabled = false,
  onSend,
  onStop,
}: {
  /** The agent is answering. */
  readonly busy: boolean;
  readonly disabled?: boolean;
  readonly onSend: (text: string) => void;
  readonly onStop: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);
  const ready = text.trim() !== '' && !busy && !disabled;

  // Back to writing once the answer is in.
  useEffect(() => {
    if (!busy) {
      field.current?.focus();
    }
  }, [busy]);

  const send = () => {
    if (!ready) {
      return;
    }
    onSend(text.trim());
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

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        send();
      }}
    >
      <InputGroup className='rounded-xl bg-background dark:bg-input/30'>
        <InputGroupTextarea
          ref={field}
          autoFocus
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={onKeyDown}
          maxLength={MESSAGE_MAX}
          disabled={disabled}
          placeholder={t('interview.placeholder')}
          aria-label={t('interview.placeholder')}
          className='max-h-60 min-h-12 px-3.5 pt-3 text-sm leading-6'
        />
        <InputGroupAddon align='block-end' className='px-2 pb-2'>
          <InputGroupText className='hidden text-xs sm:inline'>
            {t('interview.composerHint')}
          </InputGroupText>
          {busy ? (
            <InputGroupButton
              variant='secondary'
              size='icon-sm'
              className='ml-auto rounded-lg'
              onClick={onStop}
              aria-label={t('interview.stop')}
            >
              <Square className='fill-current' />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type='submit'
              variant='default'
              size='icon-sm'
              // Not `disabled`: the group would grey out the whole field with it.
              aria-disabled={!ready}
              className={cn('ml-auto rounded-lg', !ready && 'opacity-50')}
              aria-label={t('interview.send')}
            >
              <ArrowUp />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
