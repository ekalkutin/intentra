import { CircleCheck, CircleDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { FACT_TYPES, factsOf, type Fact } from '../model/facts';
import { useFieldTexts } from '../model/field-texts';

import { ChoiceValue } from './choice-value';

const CHIP =
  'inline-flex h-5 max-w-56 items-center gap-1 rounded-md border border-border bg-background px-1.5 text-xs text-muted-foreground';

/** An item's short facts (its choices, list sizes, one-line texts) as quiet chips. */
export function FactChips({
  item,
  className,
}: {
  readonly item: KnowledgeItemDto;
  readonly className?: string;
}) {
  const facts = factsOf(item);
  if (facts.length === 0) {
    return null;
  }

  return (
    <span className={cn('flex flex-wrap items-center gap-1', className)}>
      {facts.map(fact => (
        <FactChip
          key={fact.type === FACT_TYPES.answer ? fact.type : fact.field}
          item={item}
          fact={fact}
        />
      ))}
    </span>
  );
}

function FactChip({
  item,
  fact,
}: {
  readonly item: KnowledgeItemDto;
  readonly fact: Fact;
}) {
  const { t } = useTranslation();
  const texts = useFieldTexts();

  if (fact.type === FACT_TYPES.answer) {
    const answered = fact.answeredBy.length > 0;
    const Icon = answered ? CircleCheck : CircleDashed;
    return (
      <span className={CHIP}>
        <Icon
          aria-hidden
          className={cn('size-3', answered && 'text-success')}
        />
        {answered ? t('facts.answered') : t('facts.open')}
      </span>
    );
  }
  const label = texts.label(item.kind, fact.field);
  if (fact.type === FACT_TYPES.choice) {
    return (
      <span
        className={CHIP}
        title={`${label}: ${texts.option(item.kind, fact.field, fact.value)}`}
      >
        <ChoiceValue
          kind={item.kind}
          field={fact.field}
          value={fact.value}
          className='truncate'
        />
      </span>
    );
  }
  const text =
    fact.type === FACT_TYPES.count
      ? // Every list field has its plural texts; a unit test checks them.
        t(`knowledgeCounts.${fact.field}` as 'knowledgeCounts.needs', {
          count: fact.count,
        })
      : fact.value;

  return (
    <span className={CHIP} title={`${label}: ${text}`}>
      <span className='truncate'>{text}</span>
    </span>
  );
}
