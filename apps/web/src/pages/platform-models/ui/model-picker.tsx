import { ArrowDown, ArrowUp, Check, ChevronsUpDown } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from '@/shared/ui';

import {
  findOffers,
  SORT_KEYS,
  type ModelOffer,
  type Sort,
  type SortKey,
} from '../model/openrouter-models';
import type { ModelOffers } from '../model/use-model-offers';

/** Narrow screens keep the name and the input price only. */
const GRID =
  'grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-3 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem]';
const WIDE_ONLY = 'hidden sm:flex';

/** Cheap first, the longest context first. */
const FIRST_ASCENDING: Record<SortKey, boolean> = {
  name: true,
  inputPrice: true,
  outputPrice: true,
  contextLength: false,
};

const COLUMNS = [
  { key: SORT_KEYS.inputPrice, labelKey: 'inputPrice' },
  { key: SORT_KEYS.outputPrice, labelKey: 'outputPrice' },
  { key: SORT_KEYS.contextLength, labelKey: 'contextLength' },
] as const;

/**
 * Chooses an OpenRouter model Agents can run on: search by name or id, a
 * table of prices and context, sortable by each.
 */
export function ModelPicker({
  id,
  value,
  onChange,
  offers,
  invalid,
}: {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly offers: ModelOffers;
  readonly invalid: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>({
    key: SORT_KEYS.inputPrice,
    ascending: true,
  });
  const found = offers.offers ? findOffers(offers.offers, search, sort) : [];
  const number = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });
  const price = (value: number | null) =>
    value === null ? '—' : `$${number.format(value)}`;
  const context = (value: number | null) =>
    value === null
      ? '—'
      : value >= 1_000_000
        ? `${number.format(value / 1_000_000)}M`
        : `${Math.round(value / 1000)}K`;

  const choose = (offer: ModelOffer) => {
    onChange(offer.id);
    setOpen(false);
    setSearch('');
  };
  const sortBy = (key: SortKey) =>
    setSort(current =>
      current.key === key
        ? { key, ascending: !current.ascending }
        : { key, ascending: FIRST_ASCENDING[key] },
    );
  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const first = found[0];
    if (event.key === 'Enter' && first) {
      event.preventDefault();
      choose(first);
    }
  };
  const sortMark = (key: SortKey) =>
    sort.key !== key ? null : sort.ascending ? (
      <ArrowUp aria-hidden className='size-3' />
    ) : (
      <ArrowDown aria-hidden className='size-3' />
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type='button'
            variant='outline'
            aria-invalid={invalid}
            className='w-full justify-between px-2.5 font-normal'
          />
        }
      >
        {value ? (
          <span className='truncate font-mono text-xs'>{value}</span>
        ) : (
          <span className='text-muted-foreground'>
            {t('platformModels.picker.choose')}
          </span>
        )}
        <ChevronsUpDown className='text-muted-foreground' />
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-[min(40rem,calc(100vw-2rem))] gap-0 p-0'
      >
        <div className='border-b border-border p-2'>
          <Input
            autoFocus
            value={search}
            onChange={event => setSearch(event.target.value)}
            onKeyDown={onSearchKey}
            placeholder={t('platformModels.picker.search')}
            aria-label={t('platformModels.picker.search')}
          />
        </div>
        {offers.failed ? (
          <div className='flex flex-wrap items-center gap-3 p-4 text-sm'>
            <span className='text-muted-foreground'>
              {t('platformModels.picker.failed')}
            </span>
            <Button variant='outline' size='sm' onClick={offers.retry}>
              {t('common.retry')}
            </Button>
          </div>
        ) : !offers.offers ? (
          <div className='flex items-center gap-2 p-4 text-sm text-muted-foreground'>
            <Spinner />
            {t('platformModels.picker.loading')}
          </div>
        ) : (
          <>
            <div
              className={cn(
                GRID,
                'border-b border-border px-3 py-1.5 text-xs text-muted-foreground',
              )}
            >
              <SortHeader onClick={() => sortBy(SORT_KEYS.name)}>
                {t('platformModels.picker.model')}
                {sortMark(SORT_KEYS.name)}
              </SortHeader>
              {COLUMNS.map(column => (
                <SortHeader
                  key={column.key}
                  align='end'
                  className={
                    column.key === SORT_KEYS.inputPrice ? undefined : WIDE_ONLY
                  }
                  onClick={() => sortBy(column.key)}
                >
                  {sortMark(column.key)}
                  {t(`platformModels.picker.${column.labelKey}`)}
                </SortHeader>
              ))}
            </div>
            <ul
              role='listbox'
              aria-label={t('platformModels.modelId')}
              className='max-h-[min(55vh,24rem)] overflow-y-auto p-1'
            >
              {found.length === 0 ? (
                <li className='px-2 py-6 text-center text-sm text-muted-foreground'>
                  {t('platformModels.picker.empty')}
                </li>
              ) : (
                found.map(offer => (
                  <li key={offer.id} role='none'>
                    <button
                      type='button'
                      role='option'
                      aria-selected={offer.id === value}
                      onClick={() => choose(offer)}
                      className={cn(
                        GRID,
                        'w-full rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50',
                      )}
                    >
                      <span className='flex min-w-0 items-start gap-1.5'>
                        <span className='min-w-0'>
                          <span className='block truncate text-sm'>
                            {offer.name}
                          </span>
                          <span className='block truncate font-mono text-xs text-muted-foreground'>
                            {offer.id}
                          </span>
                        </span>
                        {offer.id === value && (
                          <Check
                            aria-hidden
                            className='mt-0.5 size-3.5 shrink-0'
                          />
                        )}
                      </span>
                      <Cell>{price(offer.inputPrice)}</Cell>
                      <Cell className={WIDE_ONLY}>
                        {price(offer.outputPrice)}
                      </Cell>
                      <Cell className={WIDE_ONLY}>
                        {context(offer.contextLength)}
                      </Cell>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <p className='border-t border-border px-3 py-2 text-xs text-muted-foreground'>
              {t('platformModels.picker.footer', {
                count: offers.offers.length,
              })}
            </p>
          </>
        )}
      </PopoverContent>
    </Popover>
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
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
        align === 'end' && 'justify-end',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Cell({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: React.ReactNode;
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
