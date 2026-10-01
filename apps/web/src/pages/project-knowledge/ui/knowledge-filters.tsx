import { ArrowDownUp, Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  KindIcon,
  KNOWLEDGE_VIEWS,
  parseKnowledgeView,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeListOrderDtoSchema,
  type KnowledgeKindDto,
  type KnowledgeListOrderDto,
} from '@intentra/contracts/workspace';

/** Stands for "every Kind" in the Kind select, which needs a value. */
const ALL_KINDS = 'all';

/** A select that reads as a quiet control on the tab line: no frame until it is pointed at or open. */
const QUIET_TRIGGER =
  'border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground dark:bg-transparent dark:hover:bg-accent';

/**
 * One line above the list: the status views as tabs on a hairline, their
 * labels on the page's left edge, and at its end the Kind and the order as
 * two quiet selects sized to their words (above the tabs where narrow).
 * Neither filter locks the other: each shows its counts for the other's
 * current value, and an empty pair says where to look.
 */
export function KnowledgeFilters({
  view,
  viewCounts,
  kind,
  kindCounts,
  total,
  order,
  onView,
  onKind,
  onOrder,
}: {
  readonly view: KnowledgeView;
  /** For the chosen Kind, so every tab says what it would show. */
  readonly viewCounts: Partial<Record<KnowledgeView, number>>;
  readonly kind: KnowledgeKindDto | null;
  readonly kindCounts: Partial<Record<KnowledgeKindDto, number>>;
  /** Every Kind together in the current view; unknown while the summary loads. */
  readonly total: number | undefined;
  readonly order: KnowledgeListOrderDto;
  readonly onView: (view: KnowledgeView) => void;
  readonly onKind: (kind: KnowledgeKindDto | null) => void;
  readonly onOrder: (order: KnowledgeListOrderDto) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col-reverse gap-2 border-b border-border sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
      <Tabs
        value={view}
        onValueChange={value => onView(parseKnowledgeView(String(value)))}
        className='min-w-0'
      >
        <TabsList
          variant='line'
          aria-label={t('knowledge.viewsLabel')}
          className='-mb-px h-auto! flex-wrap justify-start gap-x-5 gap-y-0 px-0'
        >
          {Object.values(KNOWLEDGE_VIEWS).map(option => (
            <TabsTrigger
              key={option}
              value={option}
              className='h-9 flex-none px-0 sm:h-11'
            >
              {t(`knowledge.views.${option}`)}
              {Boolean(viewCounts[option]) && (
                <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
                  {viewCounts[option]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div
        role='group'
        aria-label={t('knowledge.filters')}
        className='-ml-2.5 flex shrink-0 items-center gap-1 sm:-mr-2 sm:ml-0'
      >
        <KindSelect
          kind={kind}
          counts={kindCounts}
          total={total}
          onChoose={onKind}
        />
        <OrderSelect order={order} onChoose={onOrder} />
      </div>
    </div>
  );
}

/** One Kind, or every Kind, each with how many items the current view holds. */
function KindSelect({
  kind,
  counts,
  total,
  onChoose,
}: {
  readonly kind: KnowledgeKindDto | null;
  readonly counts: Partial<Record<KnowledgeKindDto, number>>;
  readonly total: number | undefined;
  readonly onChoose: (kind: KnowledgeKindDto | null) => void;
}) {
  const { t } = useTranslation();
  const options = [
    { value: ALL_KINDS, label: t('knowledge.allKinds') },
    ...KnowledgeKindDtoSchema.options.map(option => ({
      value: option,
      label: t(`kinds.${option}`),
    })),
  ];
  const countOf = (value: string) => {
    const parsed = KnowledgeKindDtoSchema.safeParse(value);
    return parsed.success ? (counts[parsed.data] ?? 0) : total;
  };
  const option = (value: string, withCount: boolean) => {
    const parsed = KnowledgeKindDtoSchema.safeParse(value);
    const count = countOf(value);
    return (
      <span
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2',
          // Nothing of it here: still choosable, the list then says where it is.
          withCount && !count && 'text-muted-foreground',
        )}
      >
        {parsed.success ? (
          <KindIcon kind={parsed.data} />
        ) : (
          <Library aria-hidden className='size-3.5 text-muted-foreground' />
        )}
        <span className='truncate'>
          {options.find(entry => entry.value === value)?.label}
        </span>
        {withCount && Boolean(count) && (
          <span className='ml-auto pl-3 font-mono text-xs text-muted-foreground tabular-nums'>
            {count}
          </span>
        )}
      </span>
    );
  };

  return (
    <Select
      items={options}
      value={kind ?? ALL_KINDS}
      onValueChange={value => {
        const parsed = KnowledgeKindDtoSchema.safeParse(value);
        onChoose(parsed.success ? parsed.data : null);
      }}
    >
      <SelectTrigger
        size='sm'
        aria-label={t('knowledge.kindLabel')}
        className={cn('max-w-52', QUIET_TRIGGER)}
      >
        <SelectValue>
          {(value: string | null) => option(value ?? ALL_KINDS, false)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align='end'
        alignItemWithTrigger={false}
        className='min-w-60'
      >
        {options.map(entry => (
          <SelectItem key={entry.value} value={entry.value}>
            {option(entry.value, true)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** By Knowledge Key, or the most recently recorded first. */
function OrderSelect({
  order,
  onChoose,
}: {
  readonly order: KnowledgeListOrderDto;
  readonly onChoose: (order: KnowledgeListOrderDto) => void;
}) {
  const { t } = useTranslation();
  const options = KnowledgeListOrderDtoSchema.options.map(option => ({
    value: option,
    label: t(`knowledge.orders.${option}`),
  }));

  return (
    <Select
      items={options}
      value={order}
      onValueChange={value => {
        const parsed = KnowledgeListOrderDtoSchema.safeParse(value);
        if (parsed.success) {
          onChoose(parsed.data);
        }
      }}
    >
      <SelectTrigger
        size='sm'
        aria-label={t('knowledge.orderLabel')}
        className={cn('shrink-0', QUIET_TRIGGER)}
      >
        <ArrowDownUp aria-hidden className='size-3.5' />
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align='end'
        alignItemWithTrigger={false}
        className='min-w-44'
      >
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
