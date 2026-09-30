import { cva, type VariantProps } from 'class-variance-authority';
import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  CircleX,
  TriangleAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

import { Badge } from '../primitives/badge';

const iconVariants = cva('', {
  variants: {
    status: {
      /** Proposed or waiting for an answer. */
      pending: 'text-muted-foreground',
      /** Approved or accepted. */
      done: 'text-success',
      /** Rejected, declined or revoked. */
      declined: 'text-destructive',
      /** No longer current. */
      inactive: 'text-muted-foreground',
      /** Needs a person to look again. */
      review: 'text-warning',
    },
  },
});

type Status = NonNullable<VariantProps<typeof iconVariants>['status']>;

const ICONS = {
  pending: CircleDashed,
  done: CircleCheck,
  declined: CircleX,
  inactive: CircleSlash,
  review: TriangleAlert,
} as const satisfies Record<Status, unknown>;

/** A status as an icon and a word, so colour is never the only signal. */
export function StatusBadge({
  status,
  className,
  children,
}: {
  readonly status: Status;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  const Icon = ICONS[status];

  return (
    <Badge
      variant='outline'
      className={cn('font-normal text-muted-foreground', className)}
    >
      <Icon data-icon='inline-start' className={iconVariants({ status })} />
      {children}
    </Badge>
  );
}
