import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  ChoiceValue,
  FIELD_CONTROLS,
  kindFields,
  KnowledgeStatusPair,
  NeedsReviewBadge,
  useFieldTexts,
  useKnowledgePrefetch,
  useKnowledgeScope,
  type KindField,
  type KnowledgeListState,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import {
  InlineMarkdown,
  LIST_ROW_LINK_CLASS,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui';
import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import { ItemSignals } from './item-signals';

/** Fields short enough for a column: choices, list sizes and one-line texts. */
function columnsOf(kind: KnowledgeKindDto): KindField[] {
  const { main, fields } = kindFields(kind);
  return fields.filter(
    field => field.name !== main && field.control !== FIELD_CONTROLS.longText,
  );
}

/** One Kind's items side by side, a column for each short field; the rows come as children. */
export function KindTable({
  kind,
  children,
}: {
  readonly kind: KnowledgeKindDto;
  readonly children: ReactNode;
}) {
  const { t } = useTranslation();
  const texts = useFieldTexts();
  const columns = columnsOf(kind);

  return (
    <div className='overflow-hidden rounded-lg border border-border bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='w-20 pl-4 text-xs font-normal text-muted-foreground'>
              {t('knowledge.key')}
            </TableHead>
            <TableHead className='min-w-64 text-xs font-normal text-muted-foreground'>
              {texts.label(kind, kindFields(kind).main)}
            </TableHead>
            {columns.map(column => (
              <TableHead
                key={column.name}
                className='text-xs font-normal whitespace-nowrap text-muted-foreground'
              >
                {texts.label(kind, column.name)}
              </TableHead>
            ))}
            <TableHead className='pr-4 text-right text-xs font-normal text-muted-foreground'>
              {t('knowledge.status')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

/** How many columns a Kind's table has: key, main field, the short fields, status. */
export function columnCount(kind: KnowledgeKindDto): number {
  return columnsOf(kind).length + 3;
}

/** Rows of a Kind's table. */
export function KindTableRows({
  kind,
  items,
  pathOf,
  state,
  showStatus,
}: {
  readonly kind: KnowledgeKindDto;
  readonly items: readonly KnowledgeItemDto[];
  readonly pathOf: (key: string) => string;
  readonly state: KnowledgeListState;
  readonly showStatus: boolean;
}) {
  const columns = columnsOf(kind);
  const { workspaceId, projectId } = useKnowledgeScope();
  const prefetch = useKnowledgePrefetch('knowledgeItem');

  return items.map(item => (
    <TableRow
      key={item.id}
      className='relative align-top focus-within:bg-accent/60 hover:bg-accent/60'
    >
      <TableCell className='py-3 pl-4 font-mono text-xs text-muted-foreground'>
        {item.key}
      </TableCell>
      <TableCell className='max-w-md py-3 whitespace-normal'>
        <Link
          to={pathOf(item.key)}
          state={state}
          onPointerEnter={() =>
            prefetch({ workspaceId, projectId, key: item.key })
          }
          onFocus={() => prefetch({ workspaceId, projectId, key: item.key })}
          className={cn('block text-sm font-medium', LIST_ROW_LINK_CLASS)}
        >
          {item.title}
        </Link>
        <InlineMarkdown className='mt-0.5 line-clamp-2 text-sm text-muted-foreground'>
          {item.mainField}
        </InlineMarkdown>
        <ItemSignals itemKey={item.key} className='mt-1.5' />
      </TableCell>
      {columns.map(column => (
        <TableCell key={column.name} className='py-3 text-sm'>
          <Cell item={item} field={column} />
        </TableCell>
      ))}
      <TableCell className='py-3 pr-4'>
        <span className='flex justify-end'>
          {showStatus ? (
            <KnowledgeStatusPair item={item} className='justify-end' />
          ) : (
            item.needsReview && <NeedsReviewBadge />
          )}
        </span>
      </TableCell>
    </TableRow>
  ));
}

/** Placeholder rows while a page of the table loads. */
export function KindTableSkeleton({
  kind,
  count,
}: {
  readonly kind: KnowledgeKindDto;
  readonly count: number;
}) {
  return Array.from({ length: count }, (_, index) => (
    <TableRow key={index} aria-hidden className='hover:bg-transparent'>
      <TableCell colSpan={columnCount(kind)} className='px-4 py-4'>
        <span className='block h-3.5 w-1/2 animate-pulse rounded-md bg-muted' />
      </TableCell>
    </TableRow>
  ));
}

function Cell({
  item,
  field,
}: {
  readonly item: KnowledgeItemDto;
  readonly field: KindField;
}) {
  const value: unknown = (item.fields as Record<string, unknown>)[field.name];
  const gap = <span className='text-muted-foreground'>—</span>;

  if (Array.isArray(value)) {
    return value.length > 0 ? (
      <span className='font-mono text-xs tabular-nums'>{value.length}</span>
    ) : (
      gap
    );
  }
  if (typeof value !== 'string' || value.length === 0) {
    return gap;
  }
  return field.control === FIELD_CONTROLS.choice ? (
    <ChoiceValue
      kind={item.kind}
      field={field.name}
      value={value}
      className='whitespace-nowrap'
    />
  ) : (
    <span>{value}</span>
  );
}
