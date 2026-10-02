import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib';

import { Button } from '../primitives/button';

/** A quiet link above the page header, back to where the page belongs. */
export function BackLink({
  to,
  label,
  mono = false,
  state,
}: {
  readonly to: string;
  readonly label: string;
  /** The label is a machine value, such as a Knowledge Key. */
  readonly mono?: boolean;
  /** Location state for the page it leads back to, such as restoring its scroll. */
  readonly state?: unknown;
}) {
  return (
    <div className='-mt-4 -mb-4'>
      <Button
        variant='ghost'
        size='sm'
        className='-ml-2 text-muted-foreground'
        render={<Link to={to} state={state} />}
        nativeButton={false}
      >
        <ArrowLeft />
        <span className={cn(mono && 'font-mono text-xs')}>{label}</span>
      </Button>
    </div>
  );
}
