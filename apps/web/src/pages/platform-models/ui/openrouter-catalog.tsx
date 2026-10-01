import { ArrowDown, ArrowUp, RefreshCw, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import {
  Button,
  Input,
  LoadError,
  PageSection,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import type { ModelProfileDto } from '@intentra/contracts/workspace';

import {
  findOffers,
  PRICE_FILTERS,
  SORT_KEYS,
  withStats,
  type ModelOffer,
  type PriceFilter,
  type Sort,
  type SortKey,
} from '../model/openrouter-models';
import { useModelFormat, type Catalog } from '../model/use-catalog';

/** Narrow screens keep the name and the input price only. */
const GRID =
  'grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-4 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem_5.5rem_5rem]';
const WIDE_ONLY = 'hidden sm:flex';

/** Cheap first, the longest context first. */
const FIRST_ASCENDING: Record<SortKey, boolean> = {
  name: true,
  inputPrice: true,
  outputPrice: true,
  contextLength: false,
  throughput: false,
  latency: true,
};

/** The speeds the filter offers, in tokens per second. */
const SPEED_STEPS = [20, 50, 100, 200] as const;
/** The latencies the filter offers, in milliseconds. */
const LATENCY_STEPS = [500, 1000, 2000, 5000] as const;
const ANY = 'any';

const COLUMNS = [
  { key: SORT_KEYS.inputPrice, labelKey: 'inputPrice', wide: false },
  { key: SORT_KEYS.outputPrice, labelKey: 'outputPrice', wide: true },
  { key: SORT_KEYS.contextLength, labelKey: 'contextLength', wide: true },
  { key: SORT_KEYS.throughput, labelKey: 'throughput', wide: true },
  { key: SORT_KEYS.latency, labelKey: 'latency', wide: true },
] as const;

/**
 * The OpenRouter models Agents can run on, searchable and sortable by price
 * and context; choosing one starts a profile on it.
 */
export function OpenRouterCatalog({
  catalog,
  profiles,
  onChoose,
}: {
  readonly catalog: Catalog;
  readonly profiles: readonly ModelProfileDto[];
  readonly onChoose: (offer: ModelOffer) => void;
}) {
  const { t } = useTranslation();
  const format = useModelFormat();
  const { offers, measures, key, setKey, hasKey, refreshing } = catalog;
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(
    PRICE_FILTERS.all,
  );
  const [minThroughput, setMinThroughput] = useState<number | null>(null);
  const [maxLatency, setMaxLatency] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>({
    key: SORT_KEYS.inputPrice,
    ascending: true,
  });
  const found = offers.offers
    ? findOffers(
        withStats(offers.offers, measures.stats),
        {
          search,
          price: priceFilter,
          minThroughput: hasKey ? minThroughput : null,
          maxLatency: hasKey ? maxLatency : null,
        },
        sort,
      )
    : [];
  /** A measured value, an ellipsis while measuring, a dash when unknown. */
  const measured = (
    id: string,
    value: number | null,
    text: (value: number) => string,
  ) =>
    value !== null
      ? text(value)
      : hasKey && !measures.stats.has(id)
        ? '…'
        : '—';
  const speedItems = [
    { value: ANY, label: t('platformModels.catalog.anySpeed') },
    ...SPEED_STEPS.map(step => ({
      value: String(step),
      label: t('platformModels.catalog.fromSpeed', { value: step }),
    })),
  ];
  const latencyItems = [
    { value: ANY, label: t('platformModels.catalog.anyLatency') },
    ...LATENCY_STEPS.map(step => ({
      value: String(step),
      label: t('platformModels.catalog.upToLatency', {
        value: format.seconds(step),
      }),
    })),
  ];
  const profilesOn = (offer: ModelOffer) =>
    profiles.filter(profile => profile.modelId === offer.id);

  const sortBy = (key: SortKey) =>
    setSort(current =>
      current.key === key
        ? { key, ascending: !current.ascending }
        : { key, ascending: FIRST_ASCENDING[key] },
    );
  const sortMark = (key: SortKey) =>
    sort.key !== key ? null : sort.ascending ? (
      <ArrowUp aria-hidden className='size-3' />
    ) : (
      <ArrowDown aria-hidden className='size-3' />
    );

  return (
    <PageSection title={t('platformModels.catalog.title')}>
      {offers.failed ? (
        <LoadError
          text={t('platformModels.picker.failed')}
          onRetry={offers.retry}
        />
      ) : !offers.offers ? (
        <div className='flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground'>
          <Spinner />
          {t('platformModels.picker.loading')}
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border border-border bg-card focus-within:has-[input:focus-visible]:border-ring'>
          <div className='relative border-b border-border'>
            <Search
              aria-hidden
              className='pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              type='search'
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={t('platformModels.picker.search')}
              aria-label={t('platformModels.picker.search')}
              className='h-10 rounded-none border-0 pr-12 pl-10 shadow-none focus-visible:ring-0 dark:bg-transparent'
            />
            <div className='absolute inset-y-0 right-2 flex items-center'>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      disabled={refreshing}
                      onClick={catalog.refresh}
                      aria-label={t('platformModels.catalog.refresh')}
                      className='text-muted-foreground'
                    />
                  }
                >
                  <RefreshCw className={cn(refreshing && 'animate-spin')} />
                </TooltipTrigger>
                <TooltipContent>
                  {t('platformModels.catalog.refresh')}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-2'>
            <ToggleGroup
              variant='outline'
              size='sm'
              spacing={0}
              value={[priceFilter]}
              onValueChange={next => {
                const [chosen] = next as PriceFilter[];
                if (chosen) {
                  setPriceFilter(chosen);
                }
              }}
              aria-label={t('platformModels.catalog.priceFilter')}
            >
              {Object.values(PRICE_FILTERS).map(filter => (
                <ToggleGroupItem key={filter} value={filter}>
                  {t(`platformModels.catalog.prices.${filter}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select
              items={speedItems}
              disabled={!hasKey}
              value={minThroughput === null ? ANY : String(minThroughput)}
              onValueChange={next =>
                setMinThroughput(
                  next === null || next === ANY ? null : Number(next),
                )
              }
            >
              <SelectTrigger
                size='sm'
                className='w-40'
                aria-label={t('platformModels.catalog.speedFilter')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {speedItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={latencyItems}
              disabled={!hasKey}
              value={maxLatency === null ? ANY : String(maxLatency)}
              onValueChange={next =>
                setMaxLatency(
                  next === null || next === ANY ? null : Number(next),
                )
              }
            >
              <SelectTrigger
                size='sm'
                className='w-40'
                aria-label={t('platformModels.catalog.latencyFilter')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {latencyItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type='password'
              autoComplete='off'
              spellCheck={false}
              value={key}
              onChange={event => setKey(event.target.value)}
              placeholder={t('platformModels.catalog.keyPlaceholder')}
              aria-label={t('platformModels.catalog.keyPlaceholder')}
              aria-invalid={measures.rejected}
              className='h-7 w-full font-mono text-xs sm:ml-auto sm:w-64'
            />
          </div>
          <div
            className={cn(
              GRID,
              'border-b border-border px-4 py-2 text-xs text-muted-foreground',
            )}
          >
            <SortHeader onClick={() => sortBy(SORT_KEYS.name)}>
              {t('platformModels.catalog.model')}
              {sortMark(SORT_KEYS.name)}
            </SortHeader>
            {COLUMNS.map(column => (
              <SortHeader
                key={column.key}
                align='end'
                className={column.wide ? WIDE_ONLY : undefined}
                onClick={() => sortBy(column.key)}
              >
                {sortMark(column.key)}
                {t(`platformModels.catalog.${column.labelKey}`)}
              </SortHeader>
            ))}
          </div>
          <ul className='max-h-[32rem] divide-y divide-border overflow-y-auto'>
            {found.length === 0 ? (
              <li className='px-4 py-6 text-sm text-muted-foreground'>
                {t('platformModels.picker.empty')}
              </li>
            ) : (
              found.map(offer => {
                const existing = profilesOn(offer);
                return (
                  <li key={offer.id}>
                    <button
                      type='button'
                      onClick={() => onChoose(offer)}
                      className={cn(
                        GRID,
                        'w-full px-4 py-2.5 text-left transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
                      )}
                    >
                      <span className='min-w-0'>
                        <span className='block truncate text-sm'>
                          {offer.name}
                        </span>
                        <span className='block truncate font-mono text-xs text-muted-foreground'>
                          {offer.id}
                        </span>
                        {existing.length > 0 && (
                          <span className='mt-0.5 block truncate text-xs text-muted-foreground'>
                            {t('platformModels.catalog.profiles', {
                              names: existing
                                .map(profile => profile.name)
                                .join(', '),
                            })}
                          </span>
                        )}
                      </span>
                      <Cell>{format.price(offer.inputPrice)}</Cell>
                      <Cell className={WIDE_ONLY}>
                        {format.price(offer.outputPrice)}
                      </Cell>
                      <Cell className={WIDE_ONLY}>
                        {format.context(offer.contextLength)}
                      </Cell>
                      <Cell className={WIDE_ONLY}>
                        {measured(offer.id, offer.throughput, format.speed)}
                      </Cell>
                      <Cell className={WIDE_ONLY}>
                        {measured(offer.id, offer.latency, format.latency)}
                      </Cell>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <p className='border-t border-border px-4 py-2 text-xs text-pretty text-muted-foreground'>
            {t('platformModels.catalog.footer', {
              count: offers.offers.length,
            })}
            {' · '}
            {measures.rejected
              ? t('platformModels.catalog.keyRejected')
              : !hasKey
                ? t('platformModels.catalog.noKey')
                : measures.remaining > 0
                  ? t('platformModels.catalog.measuring', {
                      count: measures.remaining,
                    })
                  : t('platformModels.catalog.measured')}
          </p>
        </div>
      )}
    </PageSection>
  );
}

function SortHeader({
  align = 'start',
  className,
  onClick,
  children,
}: {
  readonly align?: 'start' | 'end';
  readonly className?: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='xs'
      onClick={onClick}
      className={cn(
        '-mx-1.5 gap-1 px-1.5 font-normal text-muted-foreground hover:text-foreground',
        align === 'end' && 'justify-end justify-self-end',
        align === 'start' && 'justify-self-start',
        className,
      )}
    >
      {children}
    </Button>
  );
}

function Cell({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'justify-end text-right font-mono text-xs text-muted-foreground tabular-nums',
        className,
      )}
    >
      {children}
    </span>
  );
}
