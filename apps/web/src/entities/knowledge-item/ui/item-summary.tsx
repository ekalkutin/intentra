import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';
import { InlineMarkdown } from '@/shared/ui';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { FactChips } from './fact-chips';
import { KindBadge } from './kind-badge';
import {
  KnowledgeStatusBadge,
  NeedsReviewBadge,
} from './knowledge-status-badge';

/**
 * Enough of a Knowledge Item to understand it without opening it: key, Kind,
 * status, title, statement and short facts.
 */
export function KnowledgeItemSummary({
  item,
  title,
  clamp = 3,
}: {
  readonly item: KnowledgeItemDto;
  /** The title as a link, when the summary leads to the item. */
  readonly title?: ReactNode;
  readonly clamp?: 2 | 3 | 4;
}) {
  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-mono text-xs text-muted-foreground'>
          {item.key}
        </span>
        <KindBadge kind={item.kind} />
        <KnowledgeStatusPair item={item} className='ml-auto' />
      </div>
      <div className='text-sm leading-5 font-medium text-balance'>
        {title ?? item.title}
      </div>
      <InlineMarkdown
        className={
          clamp === 2
            ? 'line-clamp-2 text-sm text-muted-foreground'
            : clamp === 4
              ? 'line-clamp-4 text-sm text-muted-foreground'
              : 'line-clamp-3 text-sm text-muted-foreground'
        }
      >
        {item.mainField}
      </InlineMarkdown>
      <FactChips item={item} />
    </div>
  );
}

/** An item's status, then its Needs Review mark: always in this order. */
export function KnowledgeStatusPair({
  item,
  className,
}: {
  readonly item: Pick<KnowledgeItemDto, 'status' | 'needsReview'>;
  readonly className?: string;
}): ReactNode {
  return (
    <span className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <KnowledgeStatusBadge status={item.status} />
      {item.needsReview && <NeedsReviewBadge />}
    </span>
  );
}
