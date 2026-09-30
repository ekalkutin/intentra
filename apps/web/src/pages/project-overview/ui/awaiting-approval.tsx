import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { knowledgeItemPath } from '@/shared/config';
import { useFormatDate } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  InlineMarkdown,
  List,
  LIST_ROW_LINK_CLASS,
  ListEmpty,
  ListRow,
} from '@/shared/ui';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

/** How many Drafts the overview lists; the rest wait in Knowledge. */
export const AWAITING_SHOWN = 8;

/** Drafts waiting for a person to approve them, the newest first. */
export function AwaitingApproval({
  drafts,
  emailOf,
  workspaceSlug,
  projectSlug,
}: {
  readonly drafts: readonly KnowledgeItemDto[];
  readonly emailOf: (memberId: string) => string | undefined;
  readonly workspaceSlug: string;
  readonly projectSlug: string;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  return (
    <List>
      {drafts.length === 0 && (
        <ListEmpty>{t('overview.awaitingEmpty')}</ListEmpty>
      )}
      {drafts.slice(0, AWAITING_SHOWN).map(draft => (
        <ListRow
          key={draft.id}
          lead={draft.key}
          meta={
            <span className='font-mono'>{formatDate(draft.recordedAt)}</span>
          }
          interactive
        >
          <Link
            to={knowledgeItemPath(workspaceSlug, projectSlug, draft.key)}
            className={cn(
              'block truncate text-sm font-medium',
              LIST_ROW_LINK_CLASS,
            )}
          >
            {draft.title}
          </Link>
          <InlineMarkdown className='line-clamp-1 text-sm text-muted-foreground'>
            {draft.mainField}
          </InlineMarkdown>
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
