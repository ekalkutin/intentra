import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Textarea } from '@/shared/ui';

/**
 * Several short texts, one per entry, added and removed one at a time;
 * blank entries are dropped when saved.
 */
export function ListInput({
  id,
  value,
  onChange,
  ordered,
  invalid,
}: {
  readonly id: string;
  readonly value: readonly string[];
  readonly onChange: (value: string[]) => void;
  readonly ordered: boolean;
  readonly invalid: boolean;
}) {
  const { t } = useTranslation();
  const set = (index: number, entry: string) =>
    onChange(value.map((current, at) => (at === index ? entry : current)));

  return (
    <div className='flex flex-col gap-2'>
      {value.map((entry, index) => (
        <div key={index} className='flex items-start gap-2'>
          <span
            aria-hidden
            className='w-5 shrink-0 pt-[0.4375rem] text-right font-mono text-xs leading-5 text-muted-foreground tabular-nums'
          >
            {ordered ? `${index + 1}.` : '•'}
          </span>
          <Textarea
            id={index === 0 ? id : undefined}
            rows={1}
            value={entry}
            aria-invalid={invalid}
            onChange={event => set(index, event.target.value)}
            className='min-h-8 resize-none py-1.5'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={t('knowledgeEditor.removeEntry')}
            onClick={() => onChange(value.filter((_, at) => at !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
      <div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onChange([...value, ''])}
        >
          <Plus />
          {t('knowledgeEditor.addEntry')}
        </Button>
      </div>
    </div>
  );
}
