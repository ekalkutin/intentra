import { ArrowDownLeft, ArrowUpRight, GitFork } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KnowledgeItemSummary,
  KnowledgeKeyLink,
  KnowledgeStatusPair,
  useKnowledgeScope,
  type Approval,
  type KnowledgeIndex,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { LIST_ROW_LINK_CLASS } from '@/shared/ui';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeDependenciesDto,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { groupLinks, incomingLinks } from '../model/links';
import { dependencyTree } from '../model/tree';

const { rejected, obsolete, draft } = KnowledgeStatusDtoSchema.enum;

/**
 * Everything around the item, readable without opening it: what it rests on,
 * what rests on it, grouped by the Link's meaning, and the whole chain it
 * depends on; for a Draft, what approving it takes.
 */
export function ItemContext({
  item,
  index,
  dependencies,
  approval,
}: {
  readonly item: KnowledgeItemDto;
  readonly index: KnowledgeIndex;
  readonly dependencies: KnowledgeDependenciesDto | undefined;
  readonly approval: Approval | undefined;
}) {
  const { t } = useTranslation();
  const outgoing = groupLinks(item.links);
  const incoming = incomingLinks(item.key, index.items);
  const tree = dependencies ? dependencyTree(item.key, dependencies) : [];
  const deepTree = tree.some(row => row.depth > 1);
  const cascade = item.status === draft && tree.length > 1;
  const nothing = outgoing.length === 0 && incoming.length === 0;

  return (
    <section className='flex flex-col gap-6'>
      <div>
        <h2 className='text-sm font-semibold'>{t('knowledgeItem.links')}</h2>
        <p className='mt-0.5 max-w-2xl text-sm text-pretty text-muted-foreground'>
          {nothing
            ? t('knowledgeItem.noLinksHint')
            : t('knowledgeItem.linksDescription')}
        </p>
      </div>
      {outgoing.map(group => (
        <Group
          key={`out-${group.type}`}
          icon={<ArrowUpRight aria-hidden className='size-3.5' />}
          title={t(`linkTypes.${group.type}`)}
        >
          {group.keys.map(key => (
            <RelatedTile key={key} itemKey={key} item={index.byKey.get(key)} />
          ))}
        </Group>
      ))}
      {incoming.map(group => (
        <Group
          key={`in-${group.type}`}
          icon={<ArrowDownLeft aria-hidden className='size-3.5' />}
          title={t(`incomingLinkTypes.${group.type}`)}
        >
          {group.keys.map(key => (
            <RelatedTile key={key} itemKey={key} item={index.byKey.get(key)} />
          ))}
        </Group>
      ))}
      {(deepTree || cascade) && (
        <div className='flex flex-col gap-2'>
          <h3 className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <GitFork aria-hidden className='size-3.5' />
            {t('knowledgeItem.dependencies')}
          </h3>
          {cascade && (
            <p className='max-w-2xl text-sm text-pretty text-muted-foreground'>
              {t('knowledgeItem.dependenciesDescription')}
            </p>
          )}
          {cascade && approval && approval.blockers.length > 0 && (
            <p className='max-w-2xl text-sm text-pretty text-destructive'>
              {t('knowledgeItem.approveBlocked', {
                keys: approval.blockers.map(blocker => blocker.key).join(', '),
              })}
            </p>
          )}
          <ol className='rounded-lg border border-border bg-card py-1.5'>
            {tree.map(({ item: node, depth, repeat }, row) => (
              <li
                key={`${node.key}-${row}`}
                className='flex items-center gap-2 py-1.5 pr-3 text-sm'
                style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
              >
                {depth > 0 && (
                  <span
                    aria-hidden
                    className='-mt-3 h-4 w-2.5 shrink-0 rounded-bl-sm border-b border-l border-border'
                  />
                )}
                {depth === 0 ? (
                  <span className='font-mono text-[0.85em]'>{node.key}</span>
                ) : (
                  <KnowledgeKeyLink itemKey={node.key} />
                )}
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    (repeat || depth === 0) && 'text-muted-foreground',
                  )}
                >
                  {node.title}
                  {repeat && ` ${t('knowledgeItem.seeAbove')}`}
                </span>
                <KnowledgeStatusPair item={node} className='shrink-0' />
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function Group({
  icon,
  title,
  children,
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
        {icon}
        {title}
      </h3>
      <ul className='grid gap-2 md:grid-cols-2'>{children}</ul>
    </div>
  );
}

/** A linked item with enough detail to understand it; it opens the item. */
function RelatedTile({
  itemKey,
  item,
}: {
  readonly itemKey: string;
  readonly item: KnowledgeItemDto | undefined;
}) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();

  if (!item) {
    return (
      <li className='rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground'>
        <KnowledgeKeyLink itemKey={itemKey} /> {t('knowledgeItem.notInIndex')}
      </li>
    );
  }
  const faded = item.status === rejected || item.status === obsolete;

  return (
    <li
      className={cn(
        'relative rounded-lg border border-border bg-card p-3 transition-colors focus-within:bg-accent/60 hover:bg-accent/60',
        faded && 'opacity-70',
      )}
    >
      <KnowledgeItemSummary
        item={item}
        title={
          <Link to={scope.itemPath(item.key)} className={LIST_ROW_LINK_CLASS}>
            {item.title}
          </Link>
        }
      />
    </li>
  );
}
