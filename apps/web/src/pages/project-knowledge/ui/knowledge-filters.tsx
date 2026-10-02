import { ArrowDownUp, ChevronDown, Library } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindIcon,
  KNOWLEDGE_VIEWS,
  parseKnowledgeView,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
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

/** The views read every day, as tabs; the archive waits under "Ещё". */
const TAB_VIEWS: readonly KnowledgeView[] = [
  KNOWLEDGE_VIEWS.all,
  KNOWLEDGE_VIEWS.approved,
  KNOWLEDGE_VIEWS.drafts,
  KNOWLEDGE_VIEWS.review,
  KNOWLEDGE_VIEWS.gaps,
];
const MORE_VIEWS: readonly KnowledgeView[] = [
  KNOWLEDGE_VIEWS.rejected,
  KNOWLEDGE_VIEWS.obsolete,
];

/** Stands for "every Kind" in the Kind select, which needs a value. */
const ALL_KINDS = 'all';

/** A select that reads as a quiet control on the tab line: no frame until it is pointed at or open. */
const QUIET_TRIGGER =
  'border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground dark:bg-transparent dark:hover:bg-accent';

/**
 * One line above the list, the same in every view: the views read every day
 * as tabs on a hairline, their labels on the page's left edge, then "Ещё" for
 * the archive (Rejected and Obsolete), which takes the chosen archive view's
 * name and the tab's line while one is open; at the line's end the Kind and
 * the order as two quiet selects sized to their words. Where the column is
 * narrower than the line, the selects stand above the tabs. The tabs never
 * wrap: where they still do not fit, they scroll sideways and fade out at the
 * edge that hides more. Neither filter locks the other: each shows its
 * counts for the other's current value, and an empty pair says where to look.
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
  const { ref, fadeStart, fadeEnd, update } = useSideScroll();
  // The chosen tab stays in sight, also when the page opens on one past the edge.
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>('[data-active]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [ref, view]);

  return (
    // One line where the column holds it (56rem); narrower, the selects stand above the tabs.
    <div className='@container'>
      <div className='flex flex-col-reverse gap-2 border-b border-border @4xl:flex-row @4xl:items-center @4xl:justify-between @4xl:gap-4'>
        <Tabs
          value={view}
          onValueChange={value => onView(parseKnowledgeView(String(value)))}
          className='min-w-0'
        >
          {/* Room below for the active tab's line, which sits on the hairline. */}
          <div
            ref={ref}
            onScroll={update}
            className={cn(
              '-mb-px flex items-start gap-x-[1.125rem] overflow-x-auto overflow-y-hidden pb-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              fadeStart &&
                fadeEnd &&
                'mask-[linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]',
              fadeStart &&
                !fadeEnd &&
                'mask-[linear-gradient(to_right,transparent,black_2rem)]',
              !fadeStart &&
                fadeEnd &&
                'mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)]',
            )}
          >
            <TabsList
              variant='line'
              aria-label={t('knowledge.viewsLabel')}
              className='-mb-[5px] h-auto! shrink-0 flex-nowrap justify-start gap-x-[1.125rem] px-0'
            >
              {TAB_VIEWS.map(option => (
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
            <MoreViews view={view} counts={viewCounts} onView={onView} />
          </div>
        </Tabs>
        <div className='flex shrink-0 items-center gap-1 sm:self-end @4xl:self-auto'>
          <div
            role='group'
            aria-label={t('knowledge.filters')}
            // Quiet selects reach past the edges so their words end on them.
            className='-ml-2.5 flex items-center gap-1 sm:-mr-2 sm:ml-0'
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

/**
 * Whether a sideways scroller hides more at its start or its end, kept true
 * as it scrolls and as its width changes.
 */
function useSideScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [fadeStart, setFadeStart] = useState(false);
  const [fadeEnd, setFadeEnd] = useState(false);
  const update = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    // A pixel's slack: fractional widths leave the last one unreachable.
    setFadeStart(element.scrollLeft > 1);
    setFadeEnd(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    );
  }, []);
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) {
      observer.observe(element.firstElementChild);
    }

    return () => observer.disconnect();
  }, [update]);

  return { ref, fadeStart, fadeEnd, update };
}

/**
 * "Ещё": the archive views in a menu, after the tabs and looking like one. While
 * an archive view is open it carries that view's name and count and the tab's
 * line, so the chosen view is always named on the line.
 */
function MoreViews({
  view,
  counts,
  onView,
}: {
  readonly view: KnowledgeView;
  readonly counts: Partial<Record<KnowledgeView, number>>;
  readonly onView: (view: KnowledgeView) => void;
}) {
  const { t } = useTranslation();
  const chosen = MORE_VIEWS.includes(view) ? view : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-active={chosen ? '' : undefined}
        className={cn(
          // The tab's own geometry: its 3px inset, its height, its line on the hairline.
          'relative mt-[3px] inline-flex h-9 shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap text-foreground/60 outline-none hover:text-foreground focus-visible:rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 data-popup-open:text-foreground sm:h-11 dark:text-muted-foreground dark:hover:text-foreground',
          'after:absolute after:inset-x-0 after:bottom-[-5px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity data-active:text-foreground data-active:after:opacity-100',
        )}
      >
        {chosen ? t(`knowledge.views.${chosen}`) : t('knowledge.moreViews')}
        {chosen && Boolean(counts[chosen]) && (
          <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
            {counts[chosen]}
          </span>
        )}
        <ChevronDown aria-hidden className='size-3.5 text-muted-foreground' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-44'>
        <DropdownMenuRadioGroup
          value={chosen ?? ''}
          onValueChange={value => onView(parseKnowledgeView(String(value)))}
        >
          {MORE_VIEWS.map(option => (
            <DropdownMenuRadioItem key={option} value={option}>
              {t(`knowledge.views.${option}`)}
              <span className='ml-auto font-mono text-xs text-muted-foreground tabular-nums'>
                {counts[option] ?? 0}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
