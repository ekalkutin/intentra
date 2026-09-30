import { ArrowDownLeft, ArrowUpRight, GitFork, Network } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { useDependenciesQuery, useKnowledgeQuery } from '@/api/knowledge-api';
import { InlineMarkdown } from '@/components/markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  KnowledgeDependencyDto,
  KnowledgeItemDto,
  KnowledgeLinkTypeDto,
} from '@intentra/contracts/workspace';

import { KeyLink, KindBadge, NeedsReviewBadge, StatusBadge } from './badges';
import { Facts } from './facts';
import { LINK_TYPES } from './kinds';

type Summary = KnowledgeItemDto;

/** One related item with enough detail to understand it without opening it. */
function RelatedCard({ itemKey, item }: { itemKey: string; item?: Summary }) {
  const { workspaceId, projectId } = useParams();
  if (!item) {
    return (
      <div className='rounded-lg border border-dashed p-3 text-sm text-muted-foreground'>
        <KeyLink itemKey={itemKey} /> — нет в списке (удалён или за пределами
        первых 200 элементов)
      </div>
    );
  }
  return (
    <Link
      to={`/w/${workspaceId}/p/${projectId}/knowledge/${item.key}`}
      className={cn(
        'block space-y-1.5 rounded-lg border p-3 transition-colors hover:bg-accent/50',
        (item.status === 'obsolete' || item.status === 'rejected') &&
          'opacity-70',
      )}
    >
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='font-mono text-xs font-semibold'>{item.key}</span>
        <KindBadge kind={item.kind} />
        <span className='ml-auto flex items-center gap-1.5'>
          {item.needsReview && <NeedsReviewBadge />}
          <StatusBadge status={item.status} />
        </span>
      </div>
      <div className='text-sm leading-snug font-medium'>{item.title}</div>
      <p className='line-clamp-3 text-[13px] leading-5 text-muted-foreground'>
        <InlineMarkdown>{item.mainField}</InlineMarkdown>
      </p>
      <Facts item={item} />
    </Link>
  );
}

function Group({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground'>
        {icon}
        {title}
      </div>
      <div className='grid gap-2 md:grid-cols-2'>{children}</div>
    </div>
  );
}

type TreeRow = { item: KnowledgeDependencyDto; depth: number; repeat: boolean };

/** The `depends-on` cascade as an indented tree, each item expanded once. */
function flattenTree(
  rootKey: string,
  items: KnowledgeDependencyDto[],
  links: { from: string; to: string }[],
): TreeRow[] {
  const byKey = new Map(items.map(i => [i.key, i]));
  const children = new Map<string, string[]>();
  for (const { from, to } of links) {
    children.set(from, [...(children.get(from) ?? []), to]);
  }
  const rows: TreeRow[] = [];
  const expanded = new Set<string>();
  const walk = (key: string, depth: number) => {
    const item = byKey.get(key);
    if (!item) return;
    const repeat = expanded.has(key);
    rows.push({ item, depth, repeat });
    if (repeat) return;
    expanded.add(key);
    for (const child of children.get(key) ?? []) walk(child, depth + 1);
  };
  walk(rootKey, 0);
  return rows;
}

function DependencyTree({ itemKey }: { itemKey: string }) {
  const { workspaceId = '', projectId = '' } = useParams();
  const { data, isLoading } = useDependenciesQuery({
    workspaceId,
    projectId,
    key: itemKey,
  });
  const rows = useMemo(
    () => (data ? flattenTree(itemKey, data.items, data.links) : []),
    [data, itemKey],
  );

  if (isLoading) return <Skeleton className='h-20 w-full' />;
  // Only worth showing when the cascade goes deeper than the direct links.
  if (!data || rows.every(r => r.depth <= 1)) return null;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground'>
        <GitFork className='size-3.5' />
        Вся цепочка зависимостей
      </div>
      <div className='rounded-lg border p-2'>
        {rows.map(({ item, depth, repeat }, index) => (
          <div
            key={`${item.key}:${index}`}
            className='flex items-center gap-2 py-1 text-sm'
            style={{ paddingLeft: depth * 20 }}
          >
            {depth > 0 && <span className='text-muted-foreground'>└</span>}
            <KeyLink itemKey={item.key} />
            <span className={cn('truncate', repeat && 'text-muted-foreground')}>
              {item.title}
              {repeat && ' (см. выше)'}
            </span>
            <span className='ml-auto flex shrink-0 items-center gap-1.5'>
              {item.needsReview && <NeedsReviewBadge />}
              <StatusBadge status={item.status} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Everything around a Knowledge Item: what it links to, what links to it, and
 * the whole chain it depends on, so a reader sees its context at a glance.
 */
export function ItemContext({ item }: { item: KnowledgeItemDto }) {
  const { workspaceId = '', projectId = '' } = useParams();
  const { data, isLoading } = useKnowledgeQuery({
    workspaceId,
    projectId,
    statuses: ['draft', 'approved', 'rejected', 'obsolete'],
    take: 200,
  });

  const byKey = useMemo(
    () => new Map((data?.items ?? []).map(i => [i.key, i])),
    [data],
  );

  const incoming = useMemo(() => {
    const groups = new Map<KnowledgeLinkTypeDto, KnowledgeItemDto[]>();
    for (const other of data?.items ?? []) {
      for (const link of other.links) {
        if (link.key !== item.key) continue;
        groups.set(link.type, [...(groups.get(link.type) ?? []), other]);
      }
    }
    return groups;
  }, [data, item.key]);

  const outgoing = useMemo(() => {
    const groups = new Map<KnowledgeLinkTypeDto, string[]>();
    for (const link of item.links) {
      groups.set(link.type, [...(groups.get(link.type) ?? []), link.key]);
    }
    return groups;
  }, [item.links]);

  const hasAnything =
    outgoing.size > 0 || incoming.size > 0 || item.answeredBy.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Network className='size-4' /> Контекст
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {isLoading ? (
          <Skeleton className='h-24 w-full' />
        ) : !hasAnything ? (
          <p className='text-sm text-muted-foreground'>
            Связей пока нет. Свяжите элемент с персонами, терминами, решениями
            или требованиями, на которые он опирается, — так его смысл будет
            понятен без пересказа.
          </p>
        ) : (
          <>
            {LINK_TYPES.filter(t => outgoing.has(t.type)).map(t => (
              <Group
                key={`out:${t.type}`}
                title={`Этот элемент ${t.label}`}
                icon={<ArrowUpRight className='size-3.5' />}
              >
                {outgoing.get(t.type)!.map(key => (
                  <RelatedCard key={key} itemKey={key} item={byKey.get(key)} />
                ))}
              </Group>
            ))}
            {item.answeredBy.length > 0 && (
              <Group
                title='Ответы на вопрос'
                icon={<ArrowDownLeft className='size-3.5' />}
              >
                {item.answeredBy.map(key => (
                  <RelatedCard key={key} itemKey={key} item={byKey.get(key)} />
                ))}
              </Group>
            )}
            {LINK_TYPES.filter(
              t => incoming.has(t.type) && t.type !== 'answers',
            ).map(t => (
              <Group
                key={`in:${t.type}`}
                title={t.incoming}
                icon={<ArrowDownLeft className='size-3.5' />}
              >
                {incoming.get(t.type)!.map(other => (
                  <RelatedCard
                    key={other.key}
                    itemKey={other.key}
                    item={other}
                  />
                ))}
              </Group>
            ))}
            {incoming.has('answers') && item.answeredBy.length === 0 && (
              <Group
                title='Предлагаемые ответы (ещё не утверждены)'
                icon={<ArrowDownLeft className='size-3.5' />}
              >
                {incoming.get('answers')!.map(other => (
                  <RelatedCard
                    key={other.key}
                    itemKey={other.key}
                    item={other}
                  />
                ))}
              </Group>
            )}
          </>
        )}
        <DependencyTree itemKey={item.key} />
      </CardContent>
    </Card>
  );
}
