import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib';

/**
 * A bordered block about the thing on the page: an optional mark, a title,
 * what to know, and at most one small action. From 640px the action keeps a
 * column of its own on the right, level with the title, so no line runs under
 * it; narrower, it closes the block, under the text it is about.
 */
export function Notice({
  icon,
  title,
  action,
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'title'> & {
  /** A 16px mark before the title, such as a status icon. */
  readonly icon?: ReactNode;
  readonly title?: ReactNode;
  /** One small (28px) button. */
  readonly action?: ReactNode;
}) {
  return (
    <div
      data-slot='notice'
      className={cn(
        'grid gap-x-8 gap-y-3 rounded-lg border border-border bg-card px-4 py-3.5 text-sm sm:grid-cols-[minmax(0,1fr)_auto]',
        className,
      )}
      {...props}
    >
      <div className='flex min-w-0 items-start gap-2.5'>
        {icon && (
          <span
            aria-hidden
            className='mt-0.5 flex shrink-0 [&>svg]:size-4 [&>svg]:shrink-0'
          >
            {icon}
          </span>
        )}
        <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
          {title && <div className='font-medium'>{title}</div>}
          <div className='text-pretty text-muted-foreground'>{children}</div>
        </div>
      </div>
      {action && (
        // A 28px control on a 20px title line: 4px out on each side keeps them level.
        <div className={cn('self-start sm:-my-1', icon && 'max-sm:pl-6.5')}>
          {action}
        </div>
      )}
    </div>
  );
}
