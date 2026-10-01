import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/shared/ui';
import type { KnowledgeStatusDto } from '@intentra/contracts/workspace';

const BADGE_STATUS = {
  draft: 'pending',
  approved: 'done',
  rejected: 'declined',
  obsolete: 'inactive',
} as const satisfies Record<KnowledgeStatusDto, string>;

/** A Knowledge Item's status as an icon and a word, perhaps with a detail after it, such as when it last changed. */
export function KnowledgeStatusBadge({
  status,
  detail,
}: {
  readonly status: KnowledgeStatusDto;
  readonly detail?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <StatusBadge status={BADGE_STATUS[status]}>
      {t(`statuses.${status}`)}
      {detail && (
        <>
          <span aria-hidden className='text-muted-foreground/50'>
            ·
          </span>
          {detail}
        </>
      )}
    </StatusBadge>
  );
}

/** The mark that something the item rests on has changed. */
export function NeedsReviewBadge() {
  const { t } = useTranslation();

  return (
    <StatusBadge status='review'>{t('knowledge.needsReview')}</StatusBadge>
  );
}
