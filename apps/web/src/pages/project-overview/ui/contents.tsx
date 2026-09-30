import { CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { List, StatusBadge } from '@/shared/ui';

import type { KindSummary } from '../model/summary';

/** Every Kind with how many of its items are approved and how many are Drafts. */
export function Contents({
  kinds,
}: {
  readonly kinds: readonly KindSummary[];
}) {
  const { t } = useTranslation();

  return (
    <List>
      {kinds.map(({ kind, approved, drafts }) => {
        const empty = approved === 0 && drafts === 0;
        return (
          <li key={kind} className='flex items-center gap-3 px-4 py-3 text-sm'>
            <span
              className={
                empty
                  ? 'min-w-0 flex-1 truncate text-muted-foreground'
                  : 'min-w-0 flex-1 truncate font-medium'
              }
            >
              {t(`kinds.${kind}`)}
            </span>
            {drafts > 0 && (
              <StatusBadge status='pending'>
                {t('overview.drafts', { count: drafts })}
              </StatusBadge>
            )}
            <span
              className={
                approved > 0
                  ? 'flex w-12 items-center justify-end gap-1.5 font-mono'
                  : 'flex w-12 items-center justify-end font-mono text-muted-foreground'
              }
              title={t('overview.approved')}
            >
              {approved > 0 && (
                <CircleCheck aria-hidden className='size-3.5 text-success' />
              )}
              <span className='sr-only'>{t('overview.approved')}: </span>
              {approved > 0 ? approved : t('overview.nothing')}
            </span>
          </li>
        );
      })}
    </List>
  );
}
