import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';

import { Textarea } from '../primitives/textarea';
import { ToggleGroup, ToggleGroupItem } from '../primitives/toggle-group';

import { Markdown } from './markdown';

const MODES = { write: 'write', preview: 'preview' } as const;

type Mode = (typeof MODES)[keyof typeof MODES];

/**
 * A long Markdown text, such as an Agent's instructions: written in a
 * growing field, read back rendered, with its length against the limit.
 */
export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  onBlur,
  maxLength,
  invalid = false,
  placeholder,
}: {
  readonly id: string;
  /** The field's label, set beside the switch between writing and reading. */
  readonly label: React.ReactNode;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly maxLength: number;
  readonly invalid?: boolean;
  readonly placeholder?: string;
}) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<Mode>(MODES.write);
  const format = (count: number) => count.toLocaleString(i18n.language);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        {label}
        <ToggleGroup
          variant='outline'
          size='sm'
          spacing={0}
          value={[mode]}
          onValueChange={next => {
            const [chosen] = next as Mode[];
            if (chosen) {
              setMode(chosen);
            }
          }}
          aria-label={t('markdownEditor.mode')}
        >
          <ToggleGroupItem value={MODES.write}>
            {t('markdownEditor.write')}
          </ToggleGroupItem>
          <ToggleGroupItem value={MODES.preview}>
            {t('markdownEditor.preview')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {mode === MODES.write ? (
        <Textarea
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid}
          placeholder={placeholder}
          spellCheck
          className='min-h-96 resize-none px-3 py-2.5 leading-6'
        />
      ) : (
        <div
          className={cn(
            'min-h-96 rounded-lg border border-border px-3 py-2.5',
            value.trim() === '' && 'text-sm text-muted-foreground',
          )}
        >
          {value.trim() === '' ? (
            t('markdownEditor.empty')
          ) : (
            <Markdown className='max-w-[72ch]'>{value}</Markdown>
          )}
        </div>
      )}
      <p
        className={cn(
          'self-end font-mono text-xs text-muted-foreground tabular-nums',
          value.length > maxLength && 'text-destructive',
        )}
      >
        {t('markdownEditor.length', {
          length: format(value.length),
          max: format(maxLength),
        })}
      </p>
    </div>
  );
}
