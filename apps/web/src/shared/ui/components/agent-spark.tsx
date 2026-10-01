import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib';

/** The agent's turning mark and its pace, as in Claude Code. */
const FRAMES = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
const FRAME_MS = 120;
/** At rest the mark shows its fullest frame. */
const REST_FRAME = FRAMES.indexOf('✳');
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * The agent's mark: a glyph that turns while the agent is at work (or about
 * to be) and rests otherwise. It never turns under reduced motion.
 */
export function AgentSpark({
  active,
  className,
}: {
  readonly active: boolean;
  readonly className?: string;
}) {
  const [frame, setFrame] = useState(REST_FRAME);

  useEffect(() => {
    if (!active || window.matchMedia(REDUCED_MOTION).matches) {
      setFrame(REST_FRAME);
      return;
    }
    const id = setInterval(
      () => setFrame(current => (current + 1) % FRAMES.length),
      FRAME_MS,
    );
    return () => clearInterval(id);
  }, [active]);

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex w-4 shrink-0 justify-center font-mono leading-none',
        className,
      )}
    >
      {FRAMES[frame]}
    </span>
  );
}
