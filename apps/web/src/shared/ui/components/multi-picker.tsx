import { Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';

import { Button } from '../primitives/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../primitives/command';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';

/** One thing to choose: an id the form keeps, and how it reads. */
export type PickerOption = {
  readonly id: string;
  readonly label: string;
  /** One quiet line under the label. */
  readonly hint?: string;
  /** A short mark after the label, such as "пишет". */
  readonly mark?: ReactNode;
  /** The label is a machine value, such as a tool's id. */
  readonly mono?: boolean;
};

/** A group of options under a heading. */
export type PickerGroup = {
  readonly heading: string;
  readonly options: readonly PickerOption[];
};

/**
 * Chooses any number of options from a searchable list in a popover; the
 * trigger is a quiet "change" button, the chosen ones are shown elsewhere.
 */
export function MultiPicker({
  groups,
  value,
  onChange,
  triggerLabel,
  searchPlaceholder,
  emptyText,
  disabled = false,
}: {
  readonly groups: readonly PickerGroup[];
  readonly value: readonly string[];
  readonly onChange: (value: string[]) => void;
  readonly triggerLabel: string;
  readonly searchPlaceholder: string;
  readonly emptyText: string;
  readonly disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const chosen = new Set(value);
  const toggle = (id: string) =>
    onChange(
      chosen.has(id) ? value.filter(other => other !== id) : [...value, id],
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            variant='ghost'
            size='sm'
            className='-mr-2 text-muted-foreground'
          />
        }
      >
        <Plus />
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className='max-h-[min(50vh,22rem)]'>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups
              .filter(group => group.options.length > 0)
              .map(group => (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {group.options.map(option => (
                    <CommandItem
                      key={option.id}
                      value={`${option.label} ${option.hint ?? ''}`}
                      data-checked={chosen.has(option.id)}
                      aria-checked={chosen.has(option.id)}
                      onSelect={() => toggle(option.id)}
                      className='items-start'
                    >
                      <span className='flex min-w-0 flex-col gap-0.5'>
                        <span className='flex items-center gap-2'>
                          <span
                            className={cn(
                              'truncate',
                              option.mono && 'font-mono text-xs',
                            )}
                          >
                            {option.label}
                          </span>
                          {option.mark}
                        </span>
                        {option.hint && (
                          <span className='line-clamp-2 text-xs text-muted-foreground'>
                            {option.hint}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
        <div className='flex justify-end border-t border-border p-1.5'>
          <Button variant='ghost' size='sm' onClick={() => setOpen(false)}>
            {t('common.done')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
