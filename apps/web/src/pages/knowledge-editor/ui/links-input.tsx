import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { kindOfKey } from '@/entities/knowledge-item';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeLinkTypeDtoSchema,
  type KnowledgeKindDto,
  type KnowledgeLinkDto,
  type KnowledgeLinkTypeDto,
} from '@intentra/contracts/workspace';

import { linkTypesFor } from '../model/editor-values';

export type LinkTarget = {
  readonly key: string;
  readonly title: string;
};

/** The item's Links: a type and a target each, added and removed one at a time. */
export function LinksInput({
  id,
  kind,
  value,
  onChange,
  targets,
  invalidRows,
}: {
  readonly id: string;
  /** The Kind of the item holding the Links, which decides the types offered. */
  readonly kind: KnowledgeKindDto;
  readonly value: readonly KnowledgeLinkDto[];
  readonly onChange: (value: KnowledgeLinkDto[]) => void;
  /** The items a Link may lead to. */
  readonly targets: readonly LinkTarget[];
  /** Rows whose target is missing. */
  readonly invalidRows: ReadonlySet<number>;
}) {
  const { t } = useTranslation();
  const types = linkTypesFor(kind).map(type => ({
    value: type,
    label: t(`linkTypes.${type}`),
  }));
  const allTargets = targets.map(target => ({
    value: target.key,
    title: target.title,
    label: `${target.key} · ${target.title}`,
  }));
  // A part-of Link leads only to a Feature.
  const targetsFor = (type: KnowledgeLinkTypeDto) =>
    type === KnowledgeLinkTypeDtoSchema.enum['part-of']
      ? allTargets.filter(
          target =>
            kindOfKey(target.value) === KnowledgeKindDtoSchema.enum.feature,
        )
      : allTargets;
  const set = (index: number, change: Partial<KnowledgeLinkDto>) =>
    onChange(
      value.map((current, at) =>
        at === index ? { ...current, ...change } : current,
      ),
    );

  return (
    <div className='flex flex-col gap-2'>
      {value.map((link, index) => (
        <div
          key={index}
          className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto]'
        >
          <Select
            items={types}
            value={link.type}
            onValueChange={type =>
              type && set(index, { type: type as KnowledgeLinkTypeDto })
            }
          >
            <SelectTrigger
              id={index === 0 ? id : undefined}
              className='w-full'
              aria-label={t('knowledgeEditor.linkType')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='order-last col-span-2 min-w-0 sm:order-none sm:col-span-1'>
            <Select
              items={targetsFor(link.type)}
              value={link.key || null}
              onValueChange={key => set(index, { key: key ?? '' })}
            >
              <SelectTrigger
                className='w-full min-w-0'
                aria-label={t('knowledgeEditor.linkTarget')}
                aria-invalid={invalidRows.has(index)}
              >
                <SelectValue placeholder={t('knowledgeEditor.chooseTarget')} />
              </SelectTrigger>
              <SelectContent>
                {targetsFor(link.type).map(target => (
                  <SelectItem key={target.value} value={target.value}>
                    <span className='truncate'>
                      <span className='font-mono text-xs'>{target.value}</span>
                      <span className='text-muted-foreground'> · </span>
                      {target.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={t('knowledgeEditor.removeLink')}
            onClick={() => onChange(value.filter((_, at) => at !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
      <div className='flex flex-wrap items-center gap-3'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={targets.length === 0}
          onClick={() =>
            onChange([
              ...value,
              { type: KnowledgeLinkTypeDtoSchema.enum['depends-on'], key: '' },
            ])
          }
        >
          <Plus />
          {t('knowledgeEditor.addLink')}
        </Button>
        {targets.length === 0 && (
          <span className='text-xs text-muted-foreground'>
            {t('knowledgeEditor.noTargets')}
          </span>
        )}
      </div>
    </div>
  );
}
