import { ArrowUp, Check, PenLine } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChoicesDto } from '@intentra/contracts/workspace';

/** The call's arguments, if they look like choices; models may send junk. */
export function readChoices(args: unknown): ChoicesDto | null {
  const value = args as Partial<ChoicesDto> | null;
  if (
    !value ||
    typeof value.question !== 'string' ||
    !Array.isArray(value.options) ||
    value.options.length < 2
  ) {
    return null;
  }
  return {
    question: value.question,
    options: value.options
      .filter(o => o && typeof o.label === 'string')
      .map(o => ({ label: o.label, description: o.description ?? null })),
    multiple: value.multiple === true,
    allowCustom: value.allowCustom !== false,
  };
}

/**
 * A question from the assistant with clear-cut answers, as cards: a click
 * sends the answer as the Member's reply. Once answered, the cards stay as a
 * record, with the picked ones marked.
 */
export function ChoiceCards({
  choices,
  answer,
  disabled,
  onAnswer,
}: {
  choices: ChoicesDto;
  /** The Member's reply that followed, if any. */
  answer: string | null;
  disabled: boolean;
  onAnswer: (text: string) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState<string | null>(null);
  const locked = answer !== null || disabled;

  const isChosen = (label: string) =>
    answer !== null &&
    (choices.multiple
      ? answer.split(', ').includes(label)
      : answer.trim() === label);
  const answeredOwn =
    answer !== null && !choices.options.some(o => isChosen(o.label));

  const pick = (label: string) => {
    if (locked) return;
    if (!choices.multiple) {
      onAnswer(label);
      return;
    }
    setPicked(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label],
    );
  };

  const sendCustom = (event: FormEvent) => {
    event.preventDefault();
    const text = custom?.trim();
    if (text && !locked) onAnswer(text);
  };

  return (
    <div
      className={cn(
        'space-y-2.5 rounded-xl border bg-muted/30 p-3',
        answer !== null && 'bg-transparent',
      )}
    >
      <p className='text-sm font-medium text-balance'>{choices.question}</p>
      <div className='grid gap-2 sm:grid-cols-2'>
        {choices.options.map(option => {
          const chosen = isChosen(option.label);
          const selected = picked.includes(option.label);
          return (
            <button
              type='button'
              key={option.label}
              disabled={locked}
              aria-pressed={choices.multiple ? selected : undefined}
              onClick={() => pick(option.label)}
              className={cn(
                'group flex items-start gap-2.5 rounded-lg border bg-background p-3 text-left transition-all',
                !locked &&
                  'hover:-translate-y-px hover:border-foreground/25 hover:shadow-sm active:translate-y-0',
                selected && 'border-primary ring-1 ring-primary',
                chosen && 'border-primary bg-primary/5 ring-1 ring-primary',
                answer !== null && !chosen && 'opacity-50',
              )}
            >
              {choices.multiple && (
                <span
                  className={cn(
                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border',
                    (selected || chosen) &&
                      'border-primary bg-primary text-primary-foreground',
                  )}
                >
                  {(selected || chosen) && <Check className='size-3' />}
                </span>
              )}
              <span className='min-w-0 flex-1'>
                <span className='block text-sm leading-snug font-medium'>
                  {option.label}
                </span>
                {option.description && (
                  <span className='mt-0.5 block text-[13px] leading-5 text-muted-foreground'>
                    {option.description}
                  </span>
                )}
              </span>
              {chosen && !choices.multiple && (
                <Check className='mt-0.5 size-4 shrink-0 text-primary' />
              )}
            </button>
          );
        })}
        {choices.allowCustom &&
          answer === null &&
          (custom === null ? (
            <button
              type='button'
              disabled={locked}
              onClick={() => setCustom('')}
              className='flex items-center gap-2.5 rounded-lg border border-dashed p-3 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground disabled:opacity-50'
            >
              <PenLine className='size-4' />
              Свой вариант…
            </button>
          ) : (
            <form
              onSubmit={sendCustom}
              className='flex items-center gap-2 rounded-lg border bg-background p-1.5 pl-3 sm:col-span-2'
            >
              <Input
                autoFocus
                value={custom}
                disabled={locked}
                placeholder='Напишите свой ответ'
                className='h-8 border-0 px-0 shadow-none focus-visible:ring-0 dark:bg-transparent'
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setCustom(null)}
              />
              <Button
                type='submit'
                size='icon-sm'
                disabled={locked || !custom.trim()}
                aria-label='Отправить свой ответ'
              >
                <ArrowUp />
              </Button>
            </form>
          ))}
      </div>
      {choices.multiple && answer === null && (
        <div className='flex items-center justify-end gap-2'>
          <span className='text-xs text-muted-foreground'>
            Можно выбрать несколько
          </span>
          <Button
            size='sm'
            disabled={locked || picked.length === 0}
            onClick={() => onAnswer(picked.join(', '))}
          >
            Отправить{picked.length > 0 && ` (${picked.length})`}
          </Button>
        </div>
      )}
      {answeredOwn && (
        <p className='text-xs text-muted-foreground'>
          Вы ответили своими словами.
        </p>
      )}
    </div>
  );
}
