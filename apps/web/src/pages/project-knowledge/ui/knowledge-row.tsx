import { Link } from 'react-router';

import {
  FactChips,
  useKnowledgePrefetch,
  useKnowledgeScope,
  type KnowledgeListState,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { InlineMarkdown, LIST_ROW_LINK_CLASS, ListRow } from '@/shared/ui';
import type {
  KnowledgeItemDto,
  MemberDto,
} from '@intentra/contracts/workspace';

import { RowLinks } from './row-links';
import { RowMeta } from './row-meta';

/**
 * One item in the list: key and title, its statement, its short facts and
 * its Links; the status, author and dates in a column on the right.
 */
export function KnowledgeRow({
  item,
  to,
  state,
  memberOf,
}: {
  readonly item: KnowledgeItemDto;
  readonly to: string;
  readonly state: KnowledgeListState;
  readonly memberOf: (memberId: string) => MemberDto | undefined;
}) {
  const { workspaceId, projectId } = useKnowledgeScope();
  const prefetch = useKnowledgePrefetch('knowledgeItem');
  // The item is read as the pointer or focus reaches the row, so it opens at once.
  const warm = () => prefetch({ workspaceId, projectId, key: item.key });

  return (
    <ListRow
      interactive
      className='gap-x-8 py-3.5'
      meta={<RowMeta item={item} memberOf={memberOf} />}
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
        <span className='mr-2 font-mono text-xs font-normal text-muted-foreground'>
          {item.key}
        </span>
        {item.title}
      </Link>
      <InlineMarkdown className='mt-1 line-clamp-2 max-w-[68ch] text-sm text-muted-foreground'>
        {item.mainField}
      </InlineMarkdown>
      <FactChips item={item} className='mt-2.5' />
      <RowLinks item={item} />
    </ListRow>
  );
}
