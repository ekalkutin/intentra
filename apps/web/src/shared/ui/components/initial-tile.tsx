import { cn } from '@/shared/lib';

/** A small square with the first letter of a name, standing in for a picture. */
export function InitialTile({
  name,
  size = 'sm',
}: {
  readonly name: string;
  readonly size?: 'sm' | 'lg';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center border border-border bg-background font-semibold text-muted-foreground uppercase',
        size === 'lg'
          ? 'size-8 rounded-md text-sm'
          : 'size-5 rounded-md text-xs',
      )}
    >
      {name.charAt(0)}
    </span>
  );
}
