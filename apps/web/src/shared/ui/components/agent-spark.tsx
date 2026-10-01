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
 * to be) and rests otherwise; at rest it may turn once now and then, as if
 * breathing. It never turns under reduced motion.
 */
export function AgentSpark({
  active,
  turnEvery,
  className,
}: {
  readonly active: boolean;
  /** At rest, one turn this often, in milliseconds; never when left out. */
  readonly turnEvery?: number;
  readonly className?: string;
}) {
  const [frame, setFrame] = useState(REST_FRAME);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) {
      setFrame(REST_FRAME);
      return;
    }
    const step = () => setFrame(current => (current + 1) % FRAMES.length);
    if (active) {
      const id = setInterval(step, FRAME_MS);
      return () => clearInterval(id);
    }
    setFrame(REST_FRAME);
    if (!turnEvery) {
      return;
    }
    // One full turn, back to rest, then quiet until the next.
    let turn: ReturnType<typeof setInterval> | undefined;
    const pause = setInterval(() => {
      let steps = 0;
      clearInterval(turn);
      turn = setInterval(() => {
        step();
        steps += 1;
        if (steps >= FRAMES.length) {
          clearInterval(turn);
        }
      }, FRAME_MS);
    }, turnEvery);
    return () => {
      clearInterval(pause);
      clearInterval(turn);
    };
  }, [active, turnEvery]);

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
