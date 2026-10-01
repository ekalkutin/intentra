import { Check, ChevronsUpDown } from 'lucide-react';
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

import { findOffers, type ModelOffer } from '../model/openrouter-models';
import type { ModelOffers } from '../model/use-model-offers';

/**
 * Chooses an OpenRouter model Agents can run on: a search over a list as
 * wide as the field, each model with its prices and context.
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
  const found = offers.offers ? findOffers(offers.offers, { search }) : [];
  const number = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });
  const price = (value: number | null) =>
    value === null ? '—' : `$${number.format(value)}`;
  const context = (value: number) =>
    value >= 1_000_000
      ? `${number.format(value / 1_000_000)}M`
      : `${Math.round(value / 1000)}K`;

  const choose = (offer: ModelOffer) => {
    onChange(offer.id);
    setOpen(false);
    setSearch('');
  };
  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const first = found[0];
    if (event.key === 'Enter' && first) {
      event.preventDefault();
      choose(first);
    }
  };

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
      <PopoverContent align='start' className='w-(--anchor-width) gap-0 p-0'>
        <div className='border-b border-border p-1.5'>
          <Input
            autoFocus
            value={search}
            onChange={event => setSearch(event.target.value)}
            onKeyDown={onSearchKey}
            placeholder={t('platformModels.picker.search')}
            aria-label={t('platformModels.picker.search')}
            className='border-0 shadow-none focus-visible:ring-0 dark:bg-transparent'
          />
        </div>
        {offers.failed ? (
          <div className='flex flex-wrap items-center gap-3 p-3 text-sm'>
            <span className='text-muted-foreground'>
              {t('platformModels.picker.failed')}
            </span>
            <Button variant='outline' size='sm' onClick={offers.retry}>
              {t('common.retry')}
            </Button>
          </div>
        ) : !offers.offers ? (
          <div className='flex items-center gap-2 p-3 text-sm text-muted-foreground'>
            <Spinner />
            {t('platformModels.picker.loading')}
          </div>
        ) : (
          <>
            <ul
              role='listbox'
              aria-label={t('platformModels.modelId')}
              className='max-h-[min(50vh,20rem)] overflow-y-auto p-1'
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
                      className='flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50'
                    >
                      <span className='min-w-0 flex-1'>
                        <span className='flex items-baseline gap-3'>
                          <span className='min-w-0 flex-1 truncate text-sm'>
                            {offer.name}
                          </span>
                          <span className='shrink-0 font-mono text-xs text-muted-foreground tabular-nums'>
                            {price(offer.inputPrice)} /{' '}
                            {price(offer.outputPrice)}
                          </span>
                        </span>
                        <span className='flex items-baseline gap-3 font-mono text-xs text-muted-foreground'>
                          <span className='min-w-0 flex-1 truncate'>
                            {offer.id}
                          </span>
                          {offer.contextLength !== null && (
                            <span className='shrink-0 tabular-nums'>
                              {context(offer.contextLength)}
                            </span>
                          )}
                        </span>
                      </span>
                      <Check
                        aria-hidden
                        className={cn(
                          'mt-0.5 size-3.5 shrink-0',
                          offer.id !== value && 'invisible',
                        )}
                      />
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
