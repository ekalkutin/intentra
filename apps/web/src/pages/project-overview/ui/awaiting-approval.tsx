import { useTranslation } from 'react-i18next';

import { useFormatDate } from '@/shared/i18n';
import { List, ListEmpty, ListRow } from '@/shared/ui';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

/** How many Drafts the overview lists; the rest wait in Knowledge. */
const SHOWN = 8;

/** Drafts waiting for a person to approve them, the newest first. */
export function AwaitingApproval({
  drafts,
  emailOf,
}: {
  readonly drafts: readonly KnowledgeItemDto[];
  readonly emailOf: (memberId: string) => string | undefined;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  return (
    <List>
      {drafts.length === 0 && (
        <ListEmpty>{t('overview.awaitingEmpty')}</ListEmpty>
      )}
      {drafts.slice(0, SHOWN).map(draft => (
        <ListRow
          key={draft.id}
          lead={draft.key}
          meta={
            <span className='font-mono'>{formatDate(draft.recordedAt)}</span>
          }
        >
          <p className='truncate text-sm font-medium'>{draft.title}</p>
          <p className='truncate text-sm text-muted-foreground'>
            {draft.mainField}
          </p>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {t('overview.recordedBy', {
              who: emailOf(draft.authorId) ?? '—',
              source: t(`sources.${draft.source}`),
            })}
          </p>
        </ListRow>
      ))}
    </List>
  );
}
