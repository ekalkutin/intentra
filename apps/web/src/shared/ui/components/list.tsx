import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib';

/**
 * The link of an `interactive` row: it stretches over the whole row and draws
 * the row's keyboard focus.
 */
export const LIST_ROW_LINK_CLASS =
  'outline-none after:absolute after:inset-0 after:content-[""] focus-visible:after:ring-2 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset';

/** Rows in one bordered block, divided by hairlines. */
export function List({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot='list'
      className={cn(
        'divide-y divide-border overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
      {...props}
    />
  );
}

/**
 * One row: an optional leading key (a Knowledge Key, a slug, a date), the
 * content, quiet facts on the right and the row's actions.
 */
export function ListRow({
  lead,
  meta,
  actions,
  interactive = false,
  className,
  children,
}: {
  readonly lead?: ReactNode;
  readonly meta?: ReactNode;
  readonly actions?: ReactNode;
  /**
   * The whole row leads somewhere: it highlights on hover, and a link in it
   * marked `after:absolute after:inset-0` covers the row.
   */
  readonly interactive?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3',
        interactive &&
          'relative transition-colors focus-within:bg-accent/60 hover:bg-accent/60',
        className,
      )}
    >
      {lead !== undefined && (
        <span className='hidden w-20 shrink-0 pt-0.5 font-mono text-xs leading-5 text-muted-foreground sm:block'>
          {lead}
        </span>
      )}
      <div className='min-w-0 flex-1 basis-48'>
        {lead !== undefined && (
          <span className='block font-mono text-xs text-muted-foreground sm:hidden'>
            {lead}
          </span>
        )}
        {children}
        {meta && (
          <span className='mt-0.5 block text-xs text-muted-foreground sm:hidden'>
            {meta}
          </span>
        )}
      </div>
      {meta && (
        <span className='hidden shrink-0 pt-0.5 text-xs leading-5 text-muted-foreground sm:block'>
          {meta}
        </span>
      )}
      {actions && (
        <div className='-my-1 flex shrink-0 items-center gap-2 self-start'>
          {actions}
        </div>
      )}
    </li>
  );
}

/** What an empty list says, and what to do about it. */
export function ListEmpty({
  children,
  action,
}: {
  readonly children: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <li className='flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-6'>
      <p className='text-sm text-pretty text-muted-foreground'>{children}</p>
      {action}
    </li>
  );
}

/** Placeholder rows while a list loads. */
export function ListSkeleton({ rows = 3 }: { readonly rows?: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <li key={index} aria-hidden className='flex items-center gap-4 px-4 py-4'>
      <span className='h-3 w-12 animate-pulse rounded-md bg-muted' />
      <span
        className='h-3.5 animate-pulse rounded-md bg-muted'
        style={{ width: `${50 - index * 10}%` }}
      />
    </li>
  ));
}
