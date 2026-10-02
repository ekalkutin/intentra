import { CircleDashed } from 'lucide-react';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { KindIcon } from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  type KnowledgeGapRuleDto,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

type Signals = {
  readonly gapsOf: (key: string) => readonly KnowledgeGapRuleDto[];
  readonly questionsOf: (key: string) => readonly KnowledgeItemDto[];
};

const SignalsContext = createContext<Signals>({
  gapsOf: () => [],
  questionsOf: () => [],
});

/** What is open about each item of the list: its Gaps and the Open Questions about it. */
export const ItemSignalsProvider = SignalsContext.Provider;

/** A hint's trigger above the row's cover link, so pointing at it opens the hint, not the item. */
const HINTED = 'relative z-10 inline-flex cursor-default items-center gap-1';

/**
 * What is open about an item, in one quiet line under its statement: how many
 * Gaps it has and how many Open Questions are open about it, each naming them
 * in a hint. Nothing when nothing is open.
 */
export function ItemSignals({
  itemKey,
  className,
}: {
  readonly itemKey: string;
  readonly className?: string;
}) {
  const { t } = useTranslation();
  const { gapsOf, questionsOf } = useContext(SignalsContext);
  const gaps = gapsOf(itemKey);
  const questions = questionsOf(itemKey);
  if (gaps.length === 0 && questions.length === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground',
        className,
      )}
    >
      {gaps.length > 0 && (
        <Tooltip>
          <TooltipTrigger render={<span className={HINTED} />}>
            <CircleDashed
              aria-hidden
              className='size-3.5 text-muted-foreground/70'
            />
            {t('knowledge.signals.gaps', { count: gaps.length })}
          </TooltipTrigger>
          <TooltipContent side='bottom' align='start' className='max-w-80'>
            <ul className='flex flex-col gap-1'>
              {gaps.map(rule => (
                <li key={rule}>{t(`knowledge.gapHints.${rule}`)}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
      {questions.length > 0 && (
        <Tooltip>
          <TooltipTrigger render={<span className={HINTED} />}>
            <KindIcon
              kind={KnowledgeKindDtoSchema.enum['open-question']}
              className='size-3.5'
            />
            {t('knowledge.signals.questions', { count: questions.length })}
          </TooltipTrigger>
          <TooltipContent side='bottom' align='start' className='max-w-80'>
            <ul className='flex flex-col gap-1'>
              {questions.map(question => (
                <li key={question.key}>
                  <span className='mr-1.5 font-mono'>{question.key}</span>
                  {question.title}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
