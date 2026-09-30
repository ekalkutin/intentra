import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib';

/** The content column of a page; it settles in when the page opens. */
export function Page({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='page'
      className={cn(
        'mx-auto flex w-full max-w-6xl animate-[page-settle_220ms_var(--ease-out-expo)_both] flex-col gap-8 px-4 pt-8 pb-16 md:px-8',
        className,
      )}
      {...props}
    />
  );
}

/** The page's title, what it is for, and its main actions. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
}) {
  return (
    <header className='flex flex-wrap items-start justify-between gap-x-6 gap-y-3'>
      <div className='min-w-0 max-w-2xl flex-1'>
        <h1 className='text-2xl font-semibold tracking-[-0.02em] text-balance'>
          {title}
        </h1>
        {description && (
          <p className='mt-1 text-sm text-pretty text-muted-foreground'>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          {actions}
        </div>
      )}
    </header>
  );
}

/** A titled part of a page. */
export function PageSection({
  title,
  description,
  actions,
  className,
  children,
}: {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className='flex flex-wrap items-end justify-between gap-x-4 gap-y-2'>
        <div className='min-w-0'>
          <h2 className='text-sm font-semibold'>{title}</h2>
          {description && (
            <p className='mt-0.5 max-w-2xl text-sm text-pretty text-muted-foreground'>
              {description}
            </p>
          )}
        </div>
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/** The shape of a page while its data loads. */
export function PageSkeleton() {
  return (
    <Page aria-busy>
      <div>
        <span className='block h-7 w-56 max-w-full animate-pulse rounded-md bg-muted' />
        <span className='mt-3 block h-4 w-96 max-w-full animate-pulse rounded-md bg-muted' />
      </div>
      <span className='block h-40 animate-pulse rounded-lg bg-muted' />
    </Page>
  );
}
