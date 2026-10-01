import { useState, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/shared/lib';

import { MATERIALISE } from './knowledge-flight';

/**
 * A record's text with a brand shimmer running over its letters, left to
 * right: the same shimmer the chat's live status uses, in the brand hue, for
 * a set number of passes; then the text is itself again. It stays still under
 * reduced motion.
 */
export function RecordWave({
  play,
  children,
}: {
  /** Whether to run it, decided as the line mounts. */
  readonly play: boolean;
  /** The record as it reads: the Knowledge Key and the title. */
  readonly children: ReactNode;
}) {
  const [shimmering, setShimmering] = useState(play);
  const [{ waveMs, wavePasses, waveSpread }] = useState(() => ({
    ...MATERIALISE,
  }));
  const shimmer = {
    '--shimmer-color': 'var(--brand)',
    '--shimmer-duration': `${waveMs}ms`,
    '--shimmer-spread': `${waveSpread}px`,
    animationIterationCount: wavePasses,
    animationFillMode: 'both',
  } as CSSProperties;

  return (
    <span
      className={cn('flex min-w-0 items-center gap-2', shimmering && 'shimmer')}
      style={shimmering ? shimmer : undefined}
      // Back to plain text once the passes are over.
      onAnimationEnd={event => {
        if (event.target === event.currentTarget) {
          setShimmering(false);
        }
      }}
    >
      {children}
    </span>
  );
}
