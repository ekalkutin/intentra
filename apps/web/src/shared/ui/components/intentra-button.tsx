import { useState, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/shared/lib';

import { Button } from '../primitives/button';

import { AgentSpark } from './agent-spark';

/** At rest the mark turns once this often, as if breathing. */
const BREATH_MS = 7000;

/**
 * An action that sets Intentra to work, in its own language: an outline in
 * the brand's ink led by its mark, which at rest now and then turns once,
 * turns while pointed at, focused or busy, and a band of light passing over
 * the button once as it is approached. A `quiet` one, for an action repeated
 * down a page, rests as muted text behind the mark and takes the brand's ink
 * only as it is approached.
 */
export function IntentraButton({
  busy = false,
  quiet = false,
  size = 'sm',
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: Omit<ComponentProps<typeof Button>, 'variant' | 'size' | 'children'> & {
  readonly size?: 'sm' | 'default';
  /** While what it started is on its way: the mark keeps turning. */
  readonly busy?: boolean;
  /** At rest only its mark in the brand's ink; the rest comes as it is approached. */
  readonly quiet?: boolean;
  readonly children: ReactNode;
}) {
  const [near, setNear] = useState(false);

  return (
    <Button
      variant='outline'
      size={size}
      className={cn(
        'group/intentra relative overflow-hidden transition-[background-color,border-color,box-shadow,color] duration-200 disabled:opacity-80',
        quiet
          ? 'border-transparent bg-transparent text-muted-foreground shadow-none dark:border-transparent hover:border-brand/35 hover:bg-brand/[0.07] hover:text-brand hover:shadow-[0_2px_10px_-2px_oklch(0.6_0.13_278/0.3)] focus-visible:border-brand/55 focus-visible:bg-brand/[0.07] focus-visible:text-brand dark:bg-transparent dark:hover:bg-brand/[0.12] dark:focus-visible:bg-brand/[0.12]'
          : 'border-brand/35 bg-brand/[0.07] text-brand shadow-[0_1px_2px_oklch(0.6_0.13_278/0.14)] hover:border-brand/55 hover:bg-brand/[0.12] hover:text-brand hover:shadow-[0_2px_10px_-2px_oklch(0.6_0.13_278/0.35)] focus-visible:border-brand/55 dark:bg-brand/[0.1] dark:hover:bg-brand/[0.16]',
        className,
      )}
      onPointerEnter={event => {
        setNear(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={event => {
        setNear(false);
        onPointerLeave?.(event);
      }}
      onFocus={event => {
        setNear(true);
        onFocus?.(event);
      }}
      onBlur={event => {
        setNear(false);
        onBlur?.(event);
      }}
      {...props}
    >
      {/* One pass of light as the hand comes near; none under reduced motion. */}
      <span
        aria-hidden
        className='pointer-events-none absolute inset-y-0 left-0 w-2/3 -translate-x-full bg-linear-to-r from-transparent via-brand/40 to-transparent group-hover/intentra:animate-[discuss-sheen_1100ms_cubic-bezier(0.45,0,0.25,1)_1] motion-reduce:hidden'
      />
      <AgentSpark
        active={near || busy}
        turnEvery={BREATH_MS}
        className={cn(
          'relative',
          size === 'sm' ? 'text-[0.9375rem]' : 'text-base',
          quiet && 'text-brand',
        )}
      />
      <span className='relative'>{children}</span>
    </Button>
  );
}
