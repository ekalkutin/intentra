import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib';

export type ChosenItem = {
  readonly id: string;
  readonly label: string;
  /** The label is a machine value, such as a tool's id. */
  readonly mono?: boolean;
  /** What it is, shown on hover. */
  readonly title?: string;
  readonly mark?: ReactNode;
  /** Where the item opens, if anywhere. */
  readonly to?: string;
};

/** What an Agent was given, one per line, or a word saying it has none. */
export function ChosenList({
  items,
  empty,
}: {
  readonly items: readonly ChosenItem[];
  readonly empty: string;
}) {
  if (items.length === 0) {
    return <p className='text-sm text-muted-foreground'>{empty}</p>;
  }

  return (
    <ul className='flex flex-col gap-1.5'>
      {items.map(item => {
        const label = (
          <span
            title={item.title}
            className={cn(
              'truncate',
              item.mono ? 'font-mono text-xs' : 'text-sm',
            )}
          >
            {item.label}
          </span>
        );
        return (
          <li
            key={item.id}
            className='flex min-w-0 items-center gap-2 leading-5'
          >
            {item.to ? (
              <Link
                to={item.to}
                className='min-w-0 truncate underline underline-offset-[0.2em]'
              >
                {label}
              </Link>
            ) : (
              label
            )}
            {item.mark}
          </li>
        );
      })}
    </ul>
  );
}
