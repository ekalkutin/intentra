import { CircleDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui';
import type { KnowledgeGapRuleDto } from '@intentra/contracts/workspace';

/** What the item misses, from the Project's Gaps; nothing when it misses nothing. */
export function ItemGaps({
  rules,
}: {
  readonly rules: readonly KnowledgeGapRuleDto[];
}) {
  const { t } = useTranslation();

  if (rules.length === 0) {
    return null;
  }

  return (
    <Alert>
      <CircleDashed />
      <AlertTitle>{t('knowledgeItem.gapsTitle')}</AlertTitle>
      <AlertDescription>
        <ul className='list-disc pl-4'>
          {rules.map(rule => (
            <li key={rule}>{t(`knowledge.gapHints.${rule}`)}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
