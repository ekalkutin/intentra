import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  FactChips,
  KnowledgeStatusPair,
  NeedsReviewBadge,
  useKnowledgePrefetch,
  useKnowledgeScope,
  type KnowledgeListState,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { InlineMarkdown, LIST_ROW_LINK_CLASS, ListRow } from '@/shared/ui';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

/**
 * One item in the list: key, title, its statement as text, its short facts;
 * status and Links on the right.
 */
export function KnowledgeRow({
  item,
  to,
  state,
  showStatus,
}: {
  readonly item: KnowledgeItemDto;
  readonly to: string;
  readonly state: KnowledgeListState;
  readonly showStatus: boolean;
}) {
  const { t } = useTranslation();
  const { workspaceId, projectId } = useKnowledgeScope();
  const prefetch = useKnowledgePrefetch('knowledgeItem');
  // The item is read as the pointer or focus reaches the row, so it opens at once.
  const warm = () => prefetch({ workspaceId, projectId, key: item.key });

  return (
    <ListRow
      lead={item.key}
      interactive
      meta={
        <span className='flex flex-col items-end gap-1.5 max-sm:items-start'>
          {showStatus ? (
            <KnowledgeStatusPair item={item} className='justify-end' />
          ) : (
            item.needsReview && <NeedsReviewBadge />
          )}
          {item.links.length > 0 && (
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Link2 aria-hidden className='size-3' />
              {t('knowledge.links', { count: item.links.length })}
            </span>
          )}
        </span>
      }
    >
      <Link
        to={to}
        state={state}
        onPointerEnter={warm}
        onFocus={warm}
        className={cn(
          'block text-sm font-medium text-balance',
          LIST_ROW_LINK_CLASS,
        )}
      >
        {item.title}
      </Link>
      <InlineMarkdown className='mt-0.5 line-clamp-2 text-sm text-muted-foreground'>
        {item.mainField}
      </InlineMarkdown>
      <FactChips item={item} className='mt-2' />
    </ListRow>
  );
}
