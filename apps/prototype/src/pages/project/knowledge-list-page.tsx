import {
  AlertTriangle,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Link2,
  MessageSquareText,
  Plus,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { useKnowledgeQuery } from '@/api/knowledge-api';
import { EmptyState, ErrorAlert, ListSkeleton } from '@/components/common';
import { InlineMarkdown } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  KindBadge,
  NeedsReviewBadge,
  StatusBadge,
} from '@/features/knowledge/badges';
import { Facts, kindColumns } from '@/features/knowledge/facts';
import { KIND_BY_ID, KINDS, STATUSES } from '@/features/knowledge/kinds';
import {
  KnowledgeFormDialog,
  type KnowledgeFormMode,
} from '@/features/knowledge/knowledge-form-dialog';
import { useProject } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import type {
  KnowledgeKindDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

const PAGE_SIZE = 50;
const DEFAULT_STATUSES: KnowledgeStatusDto[] = ['draft', 'approved'];

export function KnowledgeListPage() {
  const { workspaceId, projectId } = useProject();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<KnowledgeFormMode | null>(null);

  const kind = (params.get('kind') as KnowledgeKindDto | null) ?? undefined;
  const statuses = (params.get('statuses')?.split(',') ??
    DEFAULT_STATUSES) as KnowledgeStatusDto[];
  const needsReview = params.get('review') === '1' ? true : undefined;
  const page = Number(params.get('page') ?? '0');

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const query = useKnowledgeQuery({
    workspaceId,
    projectId,
    kind,
    statuses,
    needsReview,
    take: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
  const canRecord = query.data?.access.canRecord ?? [];

  const items = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const all = query.data?.items ?? [];
    if (!needle) return all;
    return all.filter(i =>
      `${i.key} ${i.title} ${i.mainField}`.toLowerCase().includes(needle),
    );
  }, [query.data, search]);

  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = !!kind || !!needsReview || params.has('statuses');

  const toggleStatus = (status: KnowledgeStatusDto) => {
    const next = statuses.includes(status)
      ? statuses.filter(s => s !== status)
      : [...statuses, status];
    update({ statuses: next.length ? next.join(',') : null });
  };

  return (
    <div className='flex h-full'>
      <aside className='hidden w-56 shrink-0 overflow-y-auto border-r p-3 lg:block'>
        <div className='px-2.5 pb-2 text-xs font-medium text-muted-foreground'>
          Виды
        </div>
        <nav className='flex flex-col gap-1'>
          <button
            type='button'
            onClick={() => update({ kind: null })}
            className={cn(
              'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm hover:bg-accent',
              !kind && 'bg-accent font-medium',
            )}
          >
            <BookOpenText className='size-4' /> Все знания
          </button>
          <div className='mx-2.5 my-1.5 h-px bg-border' />
          {KINDS.map(spec => (
            <button
              type='button'
              key={spec.kind}
              onClick={() => update({ kind: spec.kind })}
              className={cn(
                'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground',
                kind === spec.kind && 'bg-accent font-medium text-foreground',
              )}
            >
              <spec.icon className='size-4' /> {spec.plural}
            </button>
          ))}
        </nav>
      </aside>

      <div className='min-w-0 flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-5xl space-y-4 p-4 md:p-8'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative min-w-48 flex-1'>
              <Search className='absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Фильтр по ключу, заголовку или тексту…'
                className='pl-8'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label='Вид'
              className='h-8 rounded-lg border bg-background px-2 text-sm lg:hidden'
              value={kind ?? ''}
              onChange={e => update({ kind: e.target.value || null })}
            >
              <option value=''>Все виды</option>
              {KINDS.map(k => (
                <option key={k.kind} value={k.kind}>
                  {k.plural}
                </option>
              ))}
            </select>
            {canRecord.length > 0 && (
              <Button onClick={() => setForm({ type: 'record', kind })}>
                <Plus /> Записать
              </Button>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-1.5'>
            {STATUSES.map(({ status, label }) => (
              <Button
                key={status}
                size='xs'
                variant={statuses.includes(status) ? 'secondary' : 'ghost'}
                className={cn(
                  !statuses.includes(status) && 'text-muted-foreground',
                )}
                onClick={() => toggleStatus(status)}
              >
                {label}
              </Button>
            ))}
            <span className='mx-1 h-4 w-px bg-border' />
            <Button
              size='xs'
              variant={needsReview ? 'secondary' : 'ghost'}
              className={cn(!needsReview && 'text-muted-foreground')}
              onClick={() => update({ review: needsReview ? null : '1' })}
            >
              <AlertTriangle /> Требует проверки
            </Button>
            <span className='ml-auto text-xs text-muted-foreground'>
              Элементов: {total}
            </span>
          </div>

          <ErrorAlert error={query.error} />
          {query.isLoading ? (
            <ListSkeleton rows={6} />
          ) : items.length && kind ? (
            <div className='overflow-x-auto rounded-xl border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-20'>Ключ</TableHead>
                    <TableHead>{KIND_BY_ID[kind].label}</TableHead>
                    {kindColumns(kind).map(column => (
                      <TableHead
                        key={column.name}
                        className='whitespace-nowrap'
                      >
                        {column.label}
                      </TableHead>
                    ))}
                    <TableHead className='text-right'>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow
                      key={item.id}
                      className='cursor-pointer align-top'
                      onClick={() => navigate(item.key)}
                    >
                      <TableCell className='pt-3 font-mono text-xs font-medium text-muted-foreground'>
                        {item.key}
                      </TableCell>
                      <TableCell className='max-w-md min-w-64 whitespace-normal'>
                        <Link
                          to={item.key}
                          className='text-[15px] leading-snug font-medium hover:underline'
                          onClick={e => e.stopPropagation()}
                        >
                          {item.title}
                        </Link>
                        <p className='mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground'>
                          <InlineMarkdown>{item.mainField}</InlineMarkdown>
                        </p>
                      </TableCell>
                      {kindColumns(kind).map(column => (
                        <TableCell key={column.name} className='pt-3'>
                          {column.render(item)}
                        </TableCell>
                      ))}
                      <TableCell className='pt-3'>
                        <div className='flex flex-col items-end gap-1'>
                          <StatusBadge status={item.status} />
                          {item.needsReview && (
                            <NeedsReviewBadge causes={item.reviewCauses} />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : items.length ? (
            <div className='divide-y rounded-xl border'>
              {items.map(item => (
                <Link
                  key={item.id}
                  to={item.key}
                  className='flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-accent/50'
                >
                  <span className='w-[4.5rem] shrink-0 pt-[3px] font-mono text-xs font-medium text-muted-foreground'>
                    {item.key}
                  </span>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center gap-1.5'>
                      <span className='text-[15px] leading-snug font-medium'>
                        {item.title}
                      </span>
                      {!kind && <KindBadge kind={item.kind} />}
                    </div>
                    <p className='line-clamp-2 text-[13px] leading-5 text-muted-foreground'>
                      <InlineMarkdown>{item.mainField}</InlineMarkdown>
                    </p>
                    <Facts item={item} className='pt-0.5' />
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-1'>
                    <StatusBadge status={item.status} />
                    {item.needsReview && (
                      <NeedsReviewBadge causes={item.reviewCauses} />
                    )}
                    {item.links.length > 0 && (
                      <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <Link2 className='size-3' />
                        {item.links.length}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : filtered || search ? (
            <EmptyState
              icon={Search}
              title='Ничего не найдено'
              description='Попробуйте другие фильтры.'
              action={
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearch('');
                    setParams({}, { replace: true });
                  }}
                >
                  Сбросить фильтры
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={BookOpenText}
              title='Знаний пока нет'
              description='Расскажите ассистенту о продукте — он запишет узнанное как черновики, которые вы утвердите. Или внесите знания вручную.'
              action={
                <div className='flex gap-2'>
                  <Button onClick={() => navigate('../assistant')}>
                    <MessageSquareText /> Поговорить с ассистентом
                  </Button>
                  {canRecord.length > 0 && (
                    <Button
                      variant='outline'
                      onClick={() => setForm({ type: 'record', kind })}
                    >
                      <Plus /> Внести вручную
                    </Button>
                  )}
                </div>
              }
            />
          )}

          {pages > 1 && (
            <div className='flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                size='icon-sm'
                disabled={page === 0}
                onClick={() => update({ page: String(page - 1) })}
                aria-label='Предыдущая страница'
              >
                <ChevronLeft />
              </Button>
              <span className='text-sm text-muted-foreground'>
                {page + 1} / {pages}
              </span>
              <Button
                variant='outline'
                size='icon-sm'
                disabled={page + 1 >= pages}
                onClick={() => update({ page: String(page + 1) })}
                aria-label='Следующая страница'
              >
                <ChevronRight />
              </Button>
            </div>
          )}
          {kind && (
            <p className='text-xs text-muted-foreground'>
              {KIND_BY_ID[kind].description}
            </p>
          )}
        </div>
      </div>
      {form && (
        <KnowledgeFormDialog
          workspaceId={workspaceId}
          projectId={projectId}
          mode={form}
          canRecord={canRecord}
          open
          onOpenChange={open => !open && setForm(null)}
        />
      )}
    </div>
  );
}
