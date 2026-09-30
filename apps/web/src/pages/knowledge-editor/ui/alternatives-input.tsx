import { Plus, X } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input, Label, Textarea } from '@/shared/ui';

import type { AlternativeValue } from '../model/editor-values';

/** A Decision's rejected alternatives, each with why it was turned down. */
export function AlternativesInput({
  id,
  value,
  onChange,
}: {
  readonly id: string;
  readonly value: readonly AlternativeValue[];
  readonly onChange: (value: AlternativeValue[]) => void;
}) {
  const { t } = useTranslation();
  const own = useId();
  const set = (index: number, change: Partial<AlternativeValue>) =>
    onChange(
      value.map((current, at) =>
        at === index ? { ...current, ...change } : current,
      ),
    );

  return (
    <div className='flex flex-col gap-3'>
      {value.length > 0 && (
        <ul className='divide-y divide-border rounded-lg border border-border'>
          {value.map((entry, index) => (
            <li key={index} className='flex items-start gap-2 p-3'>
              <div className='grid min-w-0 flex-1 gap-2'>
                <Label
                  htmlFor={index === 0 ? id : `${own}-${index}-alternative`}
                  className='sr-only'
                >
                  {t('knowledgeEditor.alternative')}
                </Label>
                <Input
                  id={index === 0 ? id : `${own}-${index}-alternative`}
                  placeholder={t('knowledgeEditor.alternative')}
                  value={entry.alternative}
                  onChange={event =>
                    set(index, { alternative: event.target.value })
                  }
                />
                <Label htmlFor={`${own}-${index}-reason`} className='sr-only'>
                  {t('knowledgeEditor.alternativeReason')}
                </Label>
                <Textarea
                  id={`${own}-${index}-reason`}
                  rows={1}
                  placeholder={t('knowledgeEditor.alternativeReason')}
                  value={entry.reason}
                  onChange={event => set(index, { reason: event.target.value })}
                  className='min-h-8 resize-none py-1.5'
                />
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label={t('knowledgeEditor.removeAlternative')}
                onClick={() => onChange(value.filter((_, at) => at !== index))}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onChange([...value, { alternative: '', reason: '' }])}
        >
          <Plus />
          {t('knowledgeEditor.addAlternative')}
        </Button>
      </div>
    </div>
  );
}
