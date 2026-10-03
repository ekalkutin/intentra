import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  approvalBlockOf,
  KindBadge,
  KindIcon,
  KnowledgeKeyLink,
  useKnowledgeScope,
  type KnowledgeIndex,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { InlineMarkdown, LIST_ROW_LINK_CLASS } from '@/shared/ui';
import {
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeDependenciesDto,
  type KnowledgeDependencyDto,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { groupLinks, incomingLinks } from '../model/links';
import { dependencyTree, type TreeRow } from '../model/tree';

import { REVEALABLE_KEY_ATTRIBUTE } from './reveal-related';

const { rejected, obsolete, draft, approved } = KnowledgeStatusDtoSchema.enum;
const DEPENDS_ON = KnowledgeLinkTypeDtoSchema.enum['depends-on'];
const ANSWERS = KnowledgeLinkTypeDtoSchema.enum.answers;
// A Feature's parts have a section of their own above.
const PART_OF = KnowledgeLinkTypeDtoSchema.enum['part-of'];

/**
 * Everything around the item, readable without opening it: what it rests on,
 * what rests on it, grouped by the Link's meaning. Where what it depends on
 * goes deeper, or a Draft takes it along when approved, that group is the
 * whole chain as a tree, each item marked by what it means for approving.
 */
export function ItemContext({
  item,
  index,
  dependencies,
}: {
  readonly item: KnowledgeItemDto;
  readonly index: KnowledgeIndex;
  readonly dependencies: KnowledgeDependenciesDto | undefined;
}) {
  const { t } = useTranslation();
  const outgoing = groupLinks(item.links);
  const incoming = incomingLinks(item.key, index.items).filter(
    group => group.type !== PART_OF,
  );
  const tree = dependencies ? dependencyTree(item.key, dependencies) : [];
  const cascade = item.status === draft && tree.length > 1;
  const asTree = cascade || tree.some(row => row.depth > 1);
  // The Draft Open Questions it answers that approving it takes along, when nothing stops it.
  const goes =
    item.status === draft &&
    dependencies !== undefined &&
    !dependencies.items.some(node => approvalBlockOf(node) !== null);
  const along = new Set(
    goes
      ? dependencies.answers
          .filter(link => link.from === item.key)
          .map(link => link.to)
      : [],
  );
  const count = [...outgoing, ...incoming].reduce(
    (sum, group) => sum + group.keys.length,
    0,
  );

  return (
    <section className='flex flex-col gap-5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold'>
        {t('knowledgeItem.links')}
        {count > 0 && (
          <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
            {count}
          </span>
        )}
      </h2>
      {count === 0 && (
        <p className='-mt-3 max-w-2xl text-sm text-pretty text-muted-foreground'>
          {t('knowledgeItem.noLinksHint')}
        </p>
      )}
      {outgoing.map(group =>
        group.type === DEPENDS_ON && asTree ? (
          <DependencyTree
            key='out-tree'
            title={t(`linkTypes.${group.type}`)}
            count={group.keys.length}
            rows={tree.filter(row => row.depth > 0)}
            cascade={cascade}
          />
        ) : (
          <Group
            key={`out-${group.type}`}
            title={t(`linkTypes.${group.type}`)}
            count={group.keys.length}
          >
            <Tiles keys={group.keys} index={index} along={along} />
          </Group>
        ),
      )}
      {incoming.map(group => (
        <Group
          key={`in-${group.type}`}
          title={t(`incomingLinkTypes.${group.type}`)}
          count={group.keys.length}
        >
          <Tiles
            keys={group.keys}
            index={index}
            // The answers proposed to a question are brought into view from the notice above.
            revealable={group.type === ANSWERS}
          />
        </Group>
      ))}
    </section>
  );
}

function Group({
  title,
  count,
  children,
}: {
  readonly title: string;
  readonly count: number;
  readonly children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='flex items-baseline gap-2 text-[0.8125rem] font-medium text-muted-foreground'>
        {title}
        {count > 1 && (
          <span className='font-mono text-xs font-normal text-muted-foreground/70 tabular-nums'>
            {count}
          </span>
        )}
      </h3>
      {children}
    </div>
  );
}

function Tiles({
  keys,
  index,
  along,
  revealable = false,
}: {
  readonly keys: readonly string[];
  readonly index: KnowledgeIndex;
  /** The Drafts approved together with the item on the page. */
  readonly along?: ReadonlySet<string>;
  /** Whether a line elsewhere on the page may bring these tiles into view. */
  readonly revealable?: boolean;
}) {
  return (
    <ul className='grid gap-2 md:grid-cols-2'>
      {keys.map(key => (
        <RelatedTile
          key={key}
          itemKey={key}
          item={index.byKey.get(key)}
          along={along?.has(key) ?? false}
          revealable={revealable}
        />
      ))}
    </ul>
  );
}

/** A linked item with enough to understand it: key, Kind, title and statement; it opens the item. */
function RelatedTile({
  itemKey,
  item,
  along,
  revealable,
}: {
  readonly itemKey: string;
  readonly item: KnowledgeItemDto | undefined;
  readonly along: boolean;
  readonly revealable: boolean;
}) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();

  if (!item) {
    return (
      <li className='rounded-lg border border-dashed border-border px-3.5 py-3 text-sm text-muted-foreground'>
        <KnowledgeKeyLink itemKey={itemKey} /> {t('knowledgeItem.notInIndex')}
      </li>
    );
  }
  const faded = item.status === rejected || item.status === obsolete;

  return (
    <li
      {...(revealable && { [REVEALABLE_KEY_ATTRIBUTE]: item.key })}
      className='relative flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-card px-3.5 py-3 transition-colors duration-150 focus-within:bg-accent/60 hover:bg-accent/60'
    >
      <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-mono text-xs whitespace-nowrap text-muted-foreground'>
          {item.key}
        </span>
        <KindBadge kind={item.kind} />
        <StatusMark item={item} cascade={along} className='ml-auto' />
      </div>
      <div
        className={cn(
          'mt-0.5 line-clamp-2 text-sm leading-5 font-medium text-pretty',
          faded && 'text-muted-foreground',
        )}
      >
        <Link to={scope.itemPath(item.key)} className={LIST_ROW_LINK_CLASS}>
          {item.title}
        </Link>
      </div>
      {item.mainField && (
        <InlineMarkdown className='line-clamp-2 text-sm text-muted-foreground'>
          {item.mainField}
        </InlineMarkdown>
      )}
    </li>
  );
}

/**
 * The `depends-on` chain under the item, each row opening its item. For a
 * Draft, every row says what it means for approving: a Draft that comes along,
 * or why it stops the approval; an Approved row says nothing.
 */
function DependencyTree({
  title,
  count,
  rows,
  cascade,
}: {
  readonly title: string;
  readonly count: number;
  readonly rows: readonly TreeRow[];
  readonly cascade: boolean;
}) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();
  // What to do about it is said once, at the top of the page; here each row only names why.
  const blocked =
    cascade && rows.some(row => approvalBlockOf(row.item) !== null);

  return (
    <Group title={title} count={count}>
      <ol className='rounded-lg border border-border bg-card p-1'>
        {rows.map(({ item, depth, repeat }, row) => (
          <li
            key={`${item.key}-${row}`}
            className='relative flex min-h-9 items-center gap-2.5 rounded-md py-1.5 pr-2.5 text-sm transition-colors duration-150 focus-within:bg-accent/60 hover:bg-accent/60'
            style={{ paddingLeft: `${0.625 + (depth - 1) * 1.5}rem` }}
          >
            {depth > 1 && (
              <span
                aria-hidden
                className='-mt-3 -ml-1 h-4 w-2.5 shrink-0 rounded-bl-sm border-b border-l border-border'
              />
            )}
            <KindIcon kind={item.kind} className='size-4 shrink-0' />
            <span className='shrink-0 font-mono text-xs text-muted-foreground'>
              {item.key}
            </span>
            <Link
              to={scope.itemPath(item.key)}
              className={cn(
                LIST_ROW_LINK_CLASS,
                'min-w-0 flex-1 truncate',
                (repeat ||
                  item.status === rejected ||
                  item.status === obsolete) &&
                  'text-muted-foreground',
              )}
            >
              {item.title}
              {repeat && ` ${t('knowledgeItem.seeAbove')}`}
            </Link>
            {!repeat && (
              <StatusMark item={item} cascade={cascade} blocked={blocked} />
            )}
          </li>
        ))}
      </ol>
    </Group>
  );
}

/**
 * What a linked item's state means here, as a quiet icon and word, or
 * nothing for an Approved item. In a Draft's cascade that can go, a Draft
 * comes along; in one that cannot, what stops it says why.
 */
function StatusMark({
  item,
  cascade = false,
  blocked = false,
  className,
}: {
  readonly item: Pick<
    KnowledgeDependencyDto,
    'status' | 'needsReview' | 'access'
  >;
  /** Whether the item is in the cascade of the Draft on the page. */
  readonly cascade?: boolean;
  /** Whether something in that cascade stops the approval. */
  readonly blocked?: boolean;
  readonly className?: string;
}) {
  const { t } = useTranslation();
  const block = blocked ? approvalBlockOf(item) : null;

  if (block) {
    return (
      <Mark className={cn('text-destructive/85', className)}>
        {t(`knowledgeItem.approvalBlocks.${block}`)}
      </Mark>
    );
  }
  if (item.needsReview) {
    return (
      <Mark className={cn('text-warning/90', className)}>
        {t('knowledge.needsReview')}
      </Mark>
    );
  }
  if (item.status === approved) {
    return null;
  }

  return (
    <Mark className={cn('text-muted-foreground', className)}>
      {cascade && !blocked && item.status === draft
        ? t('knowledgeItem.approvesTogether')
        : t(`statuses.${item.status}`)}
    </Mark>
  );
}

/** A state as one quiet word: the row's Kind mark already leads it, so it carries no icon of its own. */
function Mark({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span className={cn('shrink-0 text-xs whitespace-nowrap', className)}>
      {children}
    </span>
  );
}
