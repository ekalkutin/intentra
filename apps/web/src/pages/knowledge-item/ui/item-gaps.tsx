import { CircleDashed, MessagesSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { InterviewOpening } from '@/shared/config';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Button,
} from '@/shared/ui';
import type {
  KnowledgeGapRuleDto,
  KnowledgeItemDto,
} from '@intentra/contracts/workspace';

/**
 * What the item misses, from the Project's Gaps, and a new Conversation with
 * Intentra that opens on them; nothing when it misses nothing.
 */
export function ItemGaps({
  item,
  rules,
  interviewPath,
}: {
  readonly item: KnowledgeItemDto;
  readonly rules: readonly KnowledgeGapRuleDto[];
  readonly interviewPath: string;
}) {
  const { t } = useTranslation();

  if (rules.length === 0) {
    return null;
  }

  const hints = rules.map(rule => t(`knowledge.gapHints.${rule}`));
  const opening: InterviewOpening = {
    opening: t('knowledgeItem.discussGapsPrompt', {
      key: item.key,
      title: item.title,
      gaps: hints.join(' '),
    }),
  };

  return (
    <Alert>
      <CircleDashed />
      <AlertTitle>{t('knowledgeItem.gapsTitle')}</AlertTitle>
      <AlertDescription>
        <ul className='list-disc pl-4'>
          {hints.map((hint, index) => (
            <li key={rules[index]}>{hint}</li>
          ))}
        </ul>
      </AlertDescription>
      <AlertAction>
        <Button
          variant='outline'
          size='sm'
          // A new Conversation that opens with the item's gaps as its first message.
          render={<Link to={interviewPath} state={opening} viewTransition />}
          nativeButton={false}
        >
          <MessagesSquare />
          {t('knowledgeItem.discussGaps')}
        </Button>
      </AlertAction>
    </Alert>
  );
}
